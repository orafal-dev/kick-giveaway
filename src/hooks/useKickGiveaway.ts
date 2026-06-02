import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KickChatMessage } from "@/App.types";
import { KICK_WS_URLS } from "@/constants";
import {
  CONFETTI_DURATION_MS,
  DEFAULT_SETTINGS,
  RECENT_MESSAGES_LIMIT,
  RECENT_MESSAGES_RETENTION_MS,
} from "@/giveaway/giveaway.constants";
import {
  clearPersistedState,
  loadPersistedState,
  savePersistedState,
} from "@/giveaway/giveawayStorage";
import type {
  ConnectionStatus,
  Entrant,
  GiveawayPhase,
  GiveawaySettings,
  PendingWinner,
  WinnerRecord,
} from "@/giveaway/giveaway.types";
import { pickWeightedWinner, normalizeValue } from "@/services/drawUtils";
import { fetchKickChannelInfo } from "@/services/kickApi";
import { getEligibleDrawPool, tryAddEntrant } from "@/services/kickEntrants";
import { KickWebSocketManager } from "@/services/kickWebSocket";

const createInitialState = () => {
  const persisted = loadPersistedState();

  return {
    channelName: persisted?.channelName ?? "",
    settings: persisted?.settings ?? { ...DEFAULT_SETTINGS },
    entrants: persisted?.entrants ?? [],
    winners: persisted?.winners ?? [],
    phase: (persisted?.phase === "connecting" ? "idle" : persisted?.phase) ?? "idle",
    pendingWinner: persisted?.pendingWinner ?? null,
    drawCount: persisted?.drawCount ?? 0,
    isChannelStepComplete: Boolean(persisted?.channelName?.trim()),
  };
};

export const useKickGiveaway = () => {
  const initial = useMemo(() => createInitialState(), []);

  const [channelName, setChannelName] = useState(initial.channelName);
  const [settings, setSettings] = useState<GiveawaySettings>(initial.settings);
  const [entrants, setEntrants] = useState<Entrant[]>(initial.entrants);
  const [winners, setWinners] = useState<WinnerRecord[]>(initial.winners);
  const [phase, setPhase] = useState<GiveawayPhase>(initial.phase);
  const [pendingWinner, setPendingWinner] = useState<PendingWinner | null>(
    initial.pendingWinner,
  );
  const [drawCount, setDrawCount] = useState(initial.drawCount);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle");
  const [isChannelStepComplete, setIsChannelStepComplete] = useState(
    initial.isChannelStepComplete,
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [channelModeMessage, setChannelModeMessage] = useState("");
  const [channelSubscribersOnly, setChannelSubscribersOnly] = useState(false);
  const [lastMessages, setLastMessages] = useState<KickChatMessage[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawTarget, setDrawTarget] = useState<Entrant | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(
    initial.settings.confirmTimeSeconds,
  );
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [giveawayStarted, setGiveawayStarted] = useState(
    initial.phase === "collecting" ||
      initial.phase === "drawing" ||
      initial.phase === "awaitingConfirmation" ||
      initial.phase === "completed",
  );

  const wsRef = useRef<KickWebSocketManager | null>(null);
  const settingsRef = useRef(settings);
  const pendingWinnerRef = useRef(pendingWinner);
  const countdownActiveRef = useRef(isCountdownActive);
  const confettiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelSubscribersOnlyRef = useRef(channelSubscribersOnly);
  const giveawayStartedRef = useRef(giveawayStarted);
  const phaseRef = useRef(phase);

  const channelLabel = useMemo(() => normalizeValue(channelName), [channelName]);
  const drawPool = useMemo(
    () => getEligibleDrawPool(entrants, winners),
    [entrants, winners],
  );
  const winnersTargetReached = winners.length >= settings.winnersCount;

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    pendingWinnerRef.current = pendingWinner;
  }, [pendingWinner]);

  useEffect(() => {
    countdownActiveRef.current = isCountdownActive;
  }, [isCountdownActive]);

  useEffect(() => {
    channelSubscribersOnlyRef.current = channelSubscribersOnly;
  }, [channelSubscribersOnly]);

  useEffect(() => {
    giveawayStartedRef.current = giveawayStarted;
  }, [giveawayStarted]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    savePersistedState({
      channelName,
      settings,
      entrants,
      winners,
      phase,
      pendingWinner,
      drawCount,
    });
  }, [channelName, settings, entrants, winners, phase, pendingWinner, drawCount]);

  useEffect(() => {
    const cleanupIntervalId = setInterval(() => {
      const cutoff = Date.now() - RECENT_MESSAGES_RETENTION_MS;
      setLastMessages((previousMessages) =>
        previousMessages.filter((message) => message.timestamp >= cutoff),
      );
    }, 1_000);

    return () => {
      clearInterval(cleanupIntervalId);
    };
  }, []);

  const confirmWinner = useCallback((username: string, confirmedAt: number | null = Date.now()): void => {
      setWinners((previousWinners) => {
        const alreadyRecorded = previousWinners.some(
          (winner) => normalizeValue(winner.username) === normalizeValue(username),
        );

        if (alreadyRecorded) {
          return previousWinners;
        }

        const nextWinners = [
          ...previousWinners,
          {
            username,
            confirmedAt,
            drawIndex: previousWinners.length + 1,
          },
        ];

        setPhase(
          nextWinners.length >= settingsRef.current.winnersCount
            ? "completed"
            : "collecting",
        );

        return nextWinners;
      });

      setPendingWinner(null);
      pendingWinnerRef.current = null;
      countdownActiveRef.current = false;
      setIsCountdownActive(false);
      setShowConfetti(true);

      if (confettiTimeoutRef.current) {
        clearTimeout(confettiTimeoutRef.current);
      }

      confettiTimeoutRef.current = setTimeout(() => {
        setShowConfetti(false);
        confettiTimeoutRef.current = null;
      }, CONFETTI_DURATION_MS);
  }, []);

  const handleKickMessage = useCallback(
    (chatMessage: KickChatMessage): void => {
      const cutoff = Date.now() - RECENT_MESSAGES_RETENTION_MS;
      setLastMessages((previousMessages) =>
        [chatMessage, ...previousMessages]
          .filter((message) => message.timestamp >= cutoff)
          .slice(0, RECENT_MESSAGES_LIMIT),
      );

      if (
        countdownActiveRef.current &&
        pendingWinnerRef.current &&
        normalizeValue(chatMessage.username) ===
          normalizeValue(pendingWinnerRef.current.username)
      ) {
        confirmWinner(chatMessage.username);
      }

      if (
        !giveawayStartedRef.current ||
        phaseRef.current === "idle" ||
        phaseRef.current === "connecting"
      ) {
        return;
      }

      setEntrants((previousEntrants) =>
        tryAddEntrant(
          previousEntrants,
          chatMessage,
          settingsRef.current,
          channelSubscribersOnlyRef.current,
        ),
      );
    },
    [confirmWinner],
  );

  const connectToChannel = useCallback(async (): Promise<boolean> => {
    if (!channelLabel) {
      setErrorMessage("Enter a Kick channel name.");
      return false;
    }

    setConnectionStatus("connecting");
    setPhase("connecting");
    setErrorMessage("");
    setChannelModeMessage("");

    try {
      const { chatroomId, channelId, followersOnlyMode, subscribersOnlyMode } =
        await fetchKickChannelInfo(channelLabel);

      setChannelSubscribersOnly(subscribersOnlyMode);

      if (followersOnlyMode || subscribersOnlyMode) {
        setChannelModeMessage(
          "Followers/subscribers-only mode",
        );
      }

      if (wsRef.current) {
        wsRef.current.disconnect();
      }

      const manager = new KickWebSocketManager(KICK_WS_URLS);
      wsRef.current = manager;

      manager.on("disconnect", () => {
        setConnectionStatus("idle");
        if (giveawayStarted) {
          setPhase("idle");
        }
      });

      manager.on("error", (message) => {
        setErrorMessage(message);
        setConnectionStatus("idle");
        setPhase("idle");
      });

      manager.on("message", handleKickMessage);
      manager.on("subscription_ready", () => {
        setConnectionStatus("connected");
        setPhase(giveawayStarted ? "collecting" : "idle");
      });

      manager.connect(chatroomId, channelId);
      return true;
    } catch (error) {
      setConnectionStatus("idle");
      setPhase("idle");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to connect to channel.",
      );
      return false;
    }
  }, [channelLabel, giveawayStarted, handleKickMessage]);

  const handleStartGiveaway = useCallback(async (): Promise<void> => {
    if (!channelLabel) {
      setErrorMessage("Enter a Kick channel name.");
      return;
    }

    setErrorMessage("");
    setGiveawayStarted(true);
    setPhase("connecting");

    if (connectionStatus !== "connected") {
      await connectToChannel();
      return;
    }

    setPhase("collecting");
  }, [channelLabel, connectToChannel, connectionStatus]);

  const handleChannelLandingSubmit = useCallback(async (): Promise<void> => {
    if (!channelLabel) {
      setErrorMessage("Enter a Kick channel name.");
      return;
    }

    setErrorMessage("");
    setIsChannelStepComplete(true);
    await connectToChannel();
  }, [channelLabel, connectToChannel]);

  const handleChangeChannel = useCallback((): void => {
    wsRef.current?.disconnect();
    wsRef.current = null;
    setConnectionStatus("idle");
    setGiveawayStarted(false);
    setPhase("idle");
    setIsChannelStepComplete(false);
    setChannelModeMessage("");
    setPendingWinner(null);
    setIsDrawing(false);
    setDisplayName("");
    countdownActiveRef.current = false;
    setIsCountdownActive(false);
  }, []);

  const handleClearAllData = useCallback((): void => {
    wsRef.current?.disconnect();
    wsRef.current = null;
    clearPersistedState();
    setChannelName("");
    setSettings({ ...DEFAULT_SETTINGS });
    setEntrants([]);
    setWinners([]);
    setPhase("idle");
    setPendingWinner(null);
    setDrawCount(0);
    setConnectionStatus("idle");
    setGiveawayStarted(false);
    setIsChannelStepComplete(false);
    setErrorMessage("");
    setChannelModeMessage("");
    setLastMessages([]);
    setIsDrawing(false);
    setDisplayName("");
    setShowConfetti(false);
    countdownActiveRef.current = false;
    setIsCountdownActive(false);
    setCountdownSeconds(DEFAULT_SETTINGS.confirmTimeSeconds);
  }, []);

  const handleReset = useCallback((): void => {
    setEntrants([]);
    setWinners([]);
    setPendingWinner(null);
    setDrawCount(0);
    setIsDrawing(false);
    setDrawTarget(null);
    setDisplayName("");
    countdownActiveRef.current = false;
    setIsCountdownActive(false);
    setCountdownSeconds(settings.confirmTimeSeconds);
    setPhase(connectionStatus === "connected" && giveawayStarted ? "collecting" : "idle");
  }, [connectionStatus, giveawayStarted, settings.confirmTimeSeconds]);

  const finalizeDraw = useCallback(
    (winner: Entrant): void => {
      setDisplayName(winner.username);
      setIsDrawing(false);
      setDrawTarget(null);
      setDrawCount((previous) => previous + 1);

      if (settingsRef.current.winnerConfirmationEnabled) {
        setPendingWinner({ username: winner.username, startedAt: Date.now() });
        pendingWinnerRef.current = { username: winner.username, startedAt: Date.now() };
        setCountdownSeconds(settingsRef.current.confirmTimeSeconds);
        countdownActiveRef.current = true;
        setIsCountdownActive(true);
        setPhase("awaitingConfirmation");
        return;
      }

      confirmWinner(winner.username, null);
    },
    [confirmWinner],
  );

  const handleDrawWinner = useCallback((): void => {
    if (drawPool.length === 0 || isDrawing || winnersTargetReached) {
      return;
    }

    const winner = pickWeightedWinner(drawPool);
    if (!winner) {
      return;
    }

    setDrawTarget(winner);
    setIsDrawing(true);
    setPhase("drawing");
    setDisplayName("");
    countdownActiveRef.current = false;
    setIsCountdownActive(false);
    setShowConfetti(false);
  }, [drawPool, isDrawing, winnersTargetReached]);

  const handleManualConfirm = useCallback((): void => {
    if (!pendingWinner) {
      return;
    }

    confirmWinner(pendingWinner.username);
  }, [confirmWinner, pendingWinner]);

  const handleDisconnect = useCallback((): void => {
    wsRef.current?.disconnect();
    wsRef.current = null;
    setConnectionStatus("idle");
    setPhase("idle");
    setGiveawayStarted(false);
  }, []);

  const updateSettings = useCallback((partial: Partial<GiveawaySettings>): void => {
    setSettings((previous) => ({ ...previous, ...partial }));
  }, []);

  useEffect(() => {
    if (!isCountdownActive) {
      return;
    }

    const intervalId = setInterval(() => {
      setCountdownSeconds((previousSeconds) => {
        if (previousSeconds <= 1) {
          countdownActiveRef.current = false;
          setIsCountdownActive(false);
          if (pendingWinnerRef.current) {
            confirmWinner(pendingWinnerRef.current.username, null);
          }
          return 0;
        }

        return previousSeconds - 1;
      });
    }, 1_000);

    return () => {
      clearInterval(intervalId);
    };
  }, [confirmWinner, isCountdownActive]);

  useEffect(() => {
    return () => {
      wsRef.current?.disconnect();
      if (confettiTimeoutRef.current) {
        clearTimeout(confettiTimeoutRef.current);
      }
    };
  }, []);

  return {
    channelName,
    setChannelName,
    settings,
    updateSettings,
    entrants,
    winners,
    phase,
    pendingWinner,
    drawCount,
    connectionStatus,
    isChannelStepComplete,
    errorMessage,
    channelModeMessage,
    lastMessages,
    isDrawing,
    drawTarget,
    setDrawTarget,
    displayName,
    setDisplayName,
    showConfetti,
    countdownSeconds,
    isCountdownActive,
    giveawayStarted,
    drawPool,
    winnersTargetReached,
    channelLabel,
    connectToChannel,
    handleStartGiveaway,
    handleChannelLandingSubmit,
    handleChangeChannel,
    handleClearAllData,
    handleReset,
    handleDrawWinner,
    finalizeDraw,
    handleManualConfirm,
    handleDisconnect,
    setIsDrawing,
    setPhase,
  };
};
