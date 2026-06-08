import type { KickChatMessage } from "@/App.types";
import { KICK_WS_URLS } from "@/constants";
import { devMode } from "@/config/devMode";
import { CONFETTI_DURATION_MS } from "@/giveaway/giveaway.constants";
import { GIVEAWAY_COLLECTOR_COMMANDS_CHANNEL } from "@/server/giveaway/giveawayRedisKeys";
import {
  clearConfettiInState,
  getWinnerChatCapture,
  processChatMessage,
  seedDevEntrants,
  tickCountdownInState,
} from "@/server/giveaway/giveawaySessionLogic";
import type {
  CollectorCommand,
  GiveawaySessionState,
} from "@/server/giveaway/giveawaySession.types";
import {
  getSessionState,
  listActiveSessionIds,
  replaceSessionState,
} from "@/server/giveaway/giveawaySessionStore";
import {
  disconnectRedisClients,
  getRedisSubscriber,
} from "@/server/redis/redisClient";
import { KickWebSocketManager } from "@/services/kickWebSocket";

interface ManagedSession {
  manager: KickWebSocketManager;
  countdownInterval: ReturnType<typeof setInterval> | null;
  confettiTimeout: ReturnType<typeof setTimeout> | null;
}

const parseCollectorCommand = (raw: string): CollectorCommand | null => {
  try {
    const parsed = JSON.parse(raw) as CollectorCommand;
    if (!parsed.sessionId || !parsed.type) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export class GiveawayCollector {
  private readonly sessions = new Map<string, ManagedSession>();
  private readonly connectingSessions = new Set<string>();
  private isRunning = false;

  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    const subscriber = await getRedisSubscriber();

    await subscriber.subscribe(
      GIVEAWAY_COLLECTOR_COMMANDS_CHANNEL,
      (message) => {
        const command = parseCollectorCommand(message);
        if (!command) {
          return;
        }

        void this.handleCommand(command);
      },
    );

    const sessionIds = await listActiveSessionIds();
    await Promise.all(
      sessionIds.map((sessionId) => this.syncSession(sessionId)),
    );

    console.info(
      `[collector] started; restored ${sessionIds.length} active session(s)`,
    );
  }

  async stop(): Promise<void> {
    this.isRunning = false;

    for (const sessionId of [...this.sessions.keys()]) {
      this.teardownSession(sessionId);
    }

    const subscriber = await getRedisSubscriber();
    if (subscriber.isOpen) {
      await subscriber.unsubscribe(GIVEAWAY_COLLECTOR_COMMANDS_CHANNEL);
    }

    await disconnectRedisClients();
  }

  private async handleCommand(command: CollectorCommand): Promise<void> {
    switch (command.type) {
      case "sync":
      case "connect":
        await this.syncSession(command.sessionId);
        return;
      case "stop":
        await this.stopCollecting(command.sessionId);
        return;
      case "disconnect":
        this.teardownSession(command.sessionId);
        return;
      default:
        return;
    }
  }

  private shouldMaintainWebSocket(state: GiveawaySessionState): boolean {
    return (
      Boolean(state.channelName.trim()) &&
      Boolean(state.chatroomId) &&
      (state.connectionStatus === "connecting" ||
        state.connectionStatus === "connected" ||
        state.giveawayStarted)
    );
  }

  private async syncSession(sessionId: string): Promise<void> {
    const state = await getSessionState(sessionId);
    if (!state) {
      this.teardownSession(sessionId);
      return;
    }

    if (!this.shouldMaintainWebSocket(state)) {
      if (this.sessions.has(sessionId)) {
        this.teardownSession(sessionId);
      }
      return;
    }

    if (this.connectingSessions.has(sessionId)) {
      return;
    }

    if (this.sessions.has(sessionId)) {
      this.ensureCountdownTimer(sessionId);
      return;
    }

    if (state.connectionStatus === "connected") {
      await replaceSessionState({
        ...state,
        connectionStatus: "connecting",
        phase:
          state.giveawayStarted && state.phase !== "completed"
            ? "connecting"
            : state.phase,
        errorMessage: "",
      });
    }

    await this.connectSession(sessionId);
  }

  private async connectSession(sessionId: string): Promise<void> {
    if (this.connectingSessions.has(sessionId)) {
      return;
    }

    this.connectingSessions.add(sessionId);

    const state = await getSessionState(sessionId);
    if (!state || !state.channelName.trim()) {
      this.connectingSessions.delete(sessionId);
      return;
    }

    if (!state.chatroomId) {
      await replaceSessionState({
        ...state,
        connectionStatus: "idle",
        phase: state.giveawayStarted ? "idle" : state.phase,
        errorMessage:
          "Channel metadata is missing. Reconnect from the app to resolve the Kick channel.",
      });
      this.connectingSessions.delete(sessionId);
      return;
    }

    try {
      const manager = new KickWebSocketManager([...KICK_WS_URLS]);
      const managed: ManagedSession = {
        manager,
        countdownInterval: null,
        confettiTimeout: null,
      };
      this.sessions.set(sessionId, managed);

      manager.on("disconnect", () => {
        void this.handleDisconnect(sessionId);
      });

      manager.on("error", (message) => {
        void this.handleConnectionError(sessionId, message);
      });

      manager.on("message", (chatMessage) => {
        void this.handleChatMessage(sessionId, chatMessage);
      });

      manager.on("subscription_ready", () => {
        void this.handleSubscriptionReady(sessionId);
      });

      manager.connect(state.chatroomId, state.channelId);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to connect to channel.";

      const latest = await getSessionState(sessionId);
      if (!latest) {
        this.connectingSessions.delete(sessionId);
        return;
      }

      await replaceSessionState({
        ...latest,
        connectionStatus: "idle",
        phase: latest.giveawayStarted ? "idle" : latest.phase,
        errorMessage: message,
      });
      this.teardownSession(sessionId);
    } finally {
      this.connectingSessions.delete(sessionId);
    }
  }

  private async handleSubscriptionReady(sessionId: string): Promise<void> {
    const state = await getSessionState(sessionId);
    if (!state) {
      this.teardownSession(sessionId);
      return;
    }

    let nextState: GiveawaySessionState = {
      ...state,
      connectionStatus: "connected",
      errorMessage: "",
    };

    if (
      nextState.giveawayStarted &&
      nextState.phase !== "drawing" &&
      nextState.phase !== "awaitingConfirmation" &&
      nextState.phase !== "completed"
    ) {
      nextState = {
        ...seedDevEntrants(nextState, devMode.enabled, devMode.mockEntrantCount),
        phase: "collecting",
      };
    } else if (nextState.phase === "connecting") {
      nextState = {
        ...nextState,
        phase: "idle",
      };
    }

    await replaceSessionState(nextState);
    this.ensureCountdownTimer(sessionId);
  }

  private async handleDisconnect(sessionId: string): Promise<void> {
    const state = await getSessionState(sessionId);
    if (!state) {
      this.teardownSession(sessionId);
      return;
    }

    this.teardownSession(sessionId);

    if (state.giveawayStarted && state.chatroomId) {
      await replaceSessionState({
        ...state,
        connectionStatus: "connecting",
        phase: "connecting",
        errorMessage: "",
      });
      await this.connectSession(sessionId);
      return;
    }

    await replaceSessionState({
      ...state,
      connectionStatus: "idle",
      phase: state.giveawayStarted ? "idle" : state.phase,
    });
  }

  private async handleConnectionError(
    sessionId: string,
    message: string,
  ): Promise<void> {
    const state = await getSessionState(sessionId);
    if (!state) {
      this.teardownSession(sessionId);
      return;
    }

    this.teardownSession(sessionId);

    if (state.giveawayStarted && state.chatroomId) {
      await replaceSessionState({
        ...state,
        connectionStatus: "connecting",
        phase: "connecting",
        errorMessage: message,
      });
      await this.connectSession(sessionId);
      return;
    }

    await replaceSessionState({
      ...state,
      connectionStatus: "idle",
      phase: "idle",
      errorMessage: message,
    });
  }

  private async handleChatMessage(
    sessionId: string,
    chatMessage: KickChatMessage,
  ): Promise<void> {
    const state = await getSessionState(sessionId);
    if (!state) {
      this.teardownSession(sessionId);
      return;
    }

    const capture = getWinnerChatCapture(state);
    const nextState = processChatMessage(state, chatMessage, capture);
    const persisted = await replaceSessionState(nextState);

    if (persisted.showConfetti) {
      this.scheduleConfettiClear(sessionId);
    }

    this.ensureCountdownTimer(sessionId);
  }

  private async stopCollecting(sessionId: string): Promise<void> {
    const state = await getSessionState(sessionId);
    if (!state) {
      this.teardownSession(sessionId);
      return;
    }

    await replaceSessionState({
      ...state,
      giveawayStarted: false,
      phase: "idle",
    });
    this.teardownSession(sessionId);
  }

  private ensureCountdownTimer(sessionId: string): void {
    const managed = this.sessions.get(sessionId);
    if (!managed) {
      return;
    }

    if (managed.countdownInterval) {
      return;
    }

    managed.countdownInterval = setInterval(() => {
      void this.tickCountdown(sessionId);
    }, 1_000);
  }

  private async tickCountdown(sessionId: string): Promise<void> {
    const state = await getSessionState(sessionId);
    if (!state) {
      this.clearCountdownTimer(sessionId);
      return;
    }

    if (!state.isCountdownActive) {
      this.clearCountdownTimer(sessionId);
      return;
    }

    const nextState = tickCountdownInState(state);
    if (nextState === state) {
      return;
    }

    await replaceSessionState(nextState);
    this.ensureCountdownTimer(sessionId);
  }

  private scheduleConfettiClear(sessionId: string): void {
    const managed = this.sessions.get(sessionId);
    if (!managed) {
      return;
    }

    if (managed.confettiTimeout) {
      clearTimeout(managed.confettiTimeout);
    }

    managed.confettiTimeout = setTimeout(() => {
      void this.clearConfetti(sessionId);
    }, CONFETTI_DURATION_MS);
  }

  private async clearConfetti(sessionId: string): Promise<void> {
    const state = await getSessionState(sessionId);
    if (!state || !state.showConfetti) {
      return;
    }

    await replaceSessionState(clearConfettiInState(state));

    const managed = this.sessions.get(sessionId);
    if (managed?.confettiTimeout) {
      clearTimeout(managed.confettiTimeout);
      managed.confettiTimeout = null;
    }
  }

  private clearCountdownTimer(sessionId: string): void {
    const managed = this.sessions.get(sessionId);
    if (!managed?.countdownInterval) {
      return;
    }

    clearInterval(managed.countdownInterval);
    managed.countdownInterval = null;
  }

  private teardownSession(sessionId: string): void {
    const managed = this.sessions.get(sessionId);
    if (!managed) {
      return;
    }

    this.clearCountdownTimer(sessionId);

    if (managed.confettiTimeout) {
      clearTimeout(managed.confettiTimeout);
      managed.confettiTimeout = null;
    }

    managed.manager.disconnect();
    this.sessions.delete(sessionId);
  }
}
