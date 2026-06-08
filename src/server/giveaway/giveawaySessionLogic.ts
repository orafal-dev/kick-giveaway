import type { KickChatMessage } from "@/App.types";
import {
  CONFETTI_DURATION_MS,
  DEFAULT_SETTINGS,
  RECENT_MESSAGES_LIMIT,
  RECENT_MESSAGES_RETENTION_MS,
} from "@/giveaway/giveaway.constants";
import type { Entrant, GiveawaySettings } from "@/giveaway/giveaway.types";
import { upgradeNoShowWinner } from "@/giveaway/winnerDisplay.utils";
import {
  appendConfirmationMessage,
  createWinnerChatCapture,
  isMessageFromPendingWinner,
  isMessageFromWinnerChatCapture,
  toConfirmationMessage,
  type WinnerChatCapture,
} from "@/giveaway/winnerChatMessages";
import { pickWeightedWinner, normalizeValue } from "@/services/drawUtils";
import {
  createMockKickMessages,
  seedEntrantsFromMockMessages,
} from "@/services/devMockEntrants";
import { getEligibleDrawPool, tryAddEntrant } from "@/services/kickEntrants";
import type { GiveawaySessionState } from "@/server/giveaway/giveawaySession.types";

export const GIVEAWAY_SESSION_TTL_SECONDS = 2 * 60 * 60;
export const GIVEAWAY_HEARTBEAT_STALE_MS = 5 * 60 * 1_000;

export const createInitialSessionState = (
  sessionId: string,
  partial: {
    channelName?: string;
    settings?: GiveawaySettings;
  } = {},
): GiveawaySessionState => {
  const now = Date.now();

  return {
    sessionId,
    updatedAt: now,
    lastHeartbeatAt: now,
    channelName: partial.channelName ?? "",
    chatroomId: null,
    channelId: null,
    channelSubscribersOnly: false,
    settings: partial.settings ?? { ...DEFAULT_SETTINGS },
    entrants: [],
    winners: [],
    phase: "idle",
    pendingWinner: null,
    pendingWinnerMessages: [],
    drawCount: 0,
    connectionStatus: "idle",
    giveawayStarted: false,
    errorMessage: "",
    channelModeMessage: "",
    lastMessages: [],
    countdownSeconds: partial.settings?.confirmTimeSeconds ??
      DEFAULT_SETTINGS.confirmTimeSeconds,
    isCountdownActive: false,
    drawTarget: null,
    isDrawing: false,
    displayName: "",
    showConfetti: false,
  };
};

export const touchSessionState = (
  state: GiveawaySessionState,
): GiveawaySessionState => ({
  ...state,
  updatedAt: Date.now(),
});

export const getAcceptedWinnersCount = (state: GiveawaySessionState): number =>
  state.winners.filter((winner) => !winner.noShow).length;

export const isWinnersTargetReached = (state: GiveawaySessionState): boolean =>
  getAcceptedWinnersCount(state) >= state.settings.winnersCount;

export const getDrawPool = (state: GiveawaySessionState): Entrant[] =>
  getEligibleDrawPool(state.entrants, state.winners);

export const seedDevEntrants = (
  state: GiveawaySessionState,
  devModeEnabled: boolean,
  mockEntrantCount: number,
): GiveawaySessionState => {
  if (!devModeEnabled) {
    return state;
  }

  const messages = createMockKickMessages(
    mockEntrantCount,
    state.settings.keyword,
  );

  return {
    ...state,
    entrants: seedEntrantsFromMockMessages(
      state.entrants,
      messages,
      state.settings,
      state.channelSubscribersOnly,
    ),
  };
};

export const appendRecentMessage = (
  state: GiveawaySessionState,
  chatMessage: KickChatMessage,
): GiveawaySessionState => {
  const cutoff = Date.now() - RECENT_MESSAGES_RETENTION_MS;

  return {
    ...state,
    lastMessages: [chatMessage, ...state.lastMessages]
      .filter((message) => message.timestamp >= cutoff)
      .slice(0, RECENT_MESSAGES_LIMIT),
  };
};

export const appendCapturedWinnerMessage = (
  state: GiveawaySessionState,
  chatMessage: KickChatMessage,
  capture: WinnerChatCapture,
): GiveawaySessionState => {
  if (!isMessageFromWinnerChatCapture(chatMessage, capture)) {
    return state;
  }

  const entry = toConfirmationMessage(chatMessage);

  if (state.pendingWinner) {
    return {
      ...state,
      pendingWinnerMessages: appendConfirmationMessage(
        state.pendingWinnerMessages,
        entry,
      ),
    };
  }

  return {
    ...state,
    winners: state.winners.map((winner) => {
      if (
        winner.userId !== capture.userId &&
        normalizeValue(winner.username) !== normalizeValue(capture.username)
      ) {
        return winner;
      }

      return {
        ...winner,
        confirmationMessages: appendConfirmationMessage(
          winner.confirmationMessages,
          entry,
        ),
      };
    }),
  };
};

export const confirmWinnerInState = (
  state: GiveawaySessionState,
  username: string,
  options: {
    confirmedAt?: number | null;
    showConfetti?: boolean;
    noShow?: boolean;
    confirmationMessages?: GiveawaySessionState["pendingWinnerMessages"];
    userId?: string;
  } = {},
): GiveawaySessionState => {
  const {
    confirmedAt = Date.now(),
    showConfetti = true,
    noShow = false,
    confirmationMessages = state.pendingWinnerMessages,
    userId = state.pendingWinner?.userId ?? username,
  } = options;

  const existingIndex = state.winners.findIndex(
    (winner) => normalizeValue(winner.username) === normalizeValue(username),
  );

  let nextWinners = state.winners;
  let nextPhase = state.phase;

  if (existingIndex !== -1) {
    const existing = state.winners[existingIndex]!;

    if (!existing.noShow || noShow) {
      return clearPendingWinnerState(state);
    }

    const upgradedWinners = upgradeNoShowWinner(
      state.winners,
      username,
      userId,
      confirmedAt,
      confirmationMessages,
    );

    if (!upgradedWinners) {
      return clearPendingWinnerState(state);
    }

    nextWinners = upgradedWinners;
    const acceptedCount = upgradedWinners.filter(
      (winner) => !winner.noShow,
    ).length;
    nextPhase =
      acceptedCount >= state.settings.winnersCount ? "completed" : "collecting";
  } else {
    nextWinners = [
      ...state.winners,
      {
        username,
        userId,
        confirmedAt,
        noShow,
        drawIndex: state.winners.length + 1,
        confirmationMessages: noShow ? [] : [...confirmationMessages],
      },
    ];

    const acceptedCount = nextWinners.filter((winner) => !winner.noShow).length;
    nextPhase =
      acceptedCount >= state.settings.winnersCount ? "completed" : "collecting";
  }

  return {
    ...clearPendingWinnerState(state),
    winners: nextWinners,
    phase: nextPhase,
    showConfetti: !noShow && showConfetti,
    displayName: username,
  };
};

export const clearPendingWinnerState = (
  state: GiveawaySessionState,
): GiveawaySessionState => ({
  ...state,
  pendingWinner: null,
  pendingWinnerMessages: [],
  isCountdownActive: false,
  countdownSeconds: state.settings.confirmTimeSeconds,
});

export const processChatMessage = (
  state: GiveawaySessionState,
  chatMessage: KickChatMessage,
  winnerChatCapture: WinnerChatCapture | null,
): GiveawaySessionState => {
  let nextState = appendRecentMessage(state, chatMessage);

  if (winnerChatCapture && Date.now() <= winnerChatCapture.captureUntil) {
    nextState = appendCapturedWinnerMessage(
      nextState,
      chatMessage,
      winnerChatCapture,
    );
  }

  const pending = nextState.pendingWinner;
  if (
    nextState.isCountdownActive &&
    pending &&
    isMessageFromPendingWinner(chatMessage, pending)
  ) {
    return confirmWinnerInState(nextState, pending.username, {
      confirmationMessages: nextState.pendingWinnerMessages,
    });
  }

  const isCollectingEntrants =
    nextState.giveawayStarted &&
    nextState.connectionStatus === "connected";

  if (!isCollectingEntrants) {
    return nextState;
  }

  return {
    ...nextState,
    entrants: tryAddEntrant(
      nextState.entrants,
      chatMessage,
      nextState.settings,
      nextState.channelSubscribersOnly,
    ),
  };
};

export const getWinnerChatCapture = (
  state: GiveawaySessionState,
): WinnerChatCapture | null => {
  if (!state.pendingWinner) {
    return null;
  }

  return createWinnerChatCapture(
    state.pendingWinner.userId,
    state.pendingWinner.username,
    state.pendingWinner.startedAt,
    state.settings.confirmTimeSeconds,
  );
};

export const startDrawInState = (
  state: GiveawaySessionState,
): GiveawaySessionState | null => {
  const drawPool = getDrawPool(state);

  if (
    drawPool.length === 0 ||
    state.isDrawing ||
    isWinnersTargetReached(state)
  ) {
    return null;
  }

  const winner = pickWeightedWinner(drawPool);
  if (!winner) {
    return null;
  }

  return {
    ...state,
    drawTarget: winner,
    isDrawing: true,
    phase: "drawing",
    displayName: "",
    isCountdownActive: false,
    showConfetti: false,
  };
};

export const finalizeDrawInState = (
  state: GiveawaySessionState,
  winner: Entrant,
): GiveawaySessionState => {
  const nextState: GiveawaySessionState = {
    ...state,
    displayName: winner.username,
    isDrawing: false,
    drawTarget: null,
    drawCount: state.drawCount + 1,
  };

  if (state.settings.winnerConfirmationEnabled) {
    const startedAt = Date.now();

    return {
      ...nextState,
      pendingWinner: {
        username: winner.username,
        userId: winner.userId,
        startedAt,
      },
      pendingWinnerMessages: [],
      countdownSeconds: state.settings.confirmTimeSeconds,
      isCountdownActive: true,
      phase: "awaitingConfirmation",
    };
  }

  return confirmWinnerInState(nextState, winner.username, {
    confirmedAt: null,
    showConfetti: true,
    noShow: false,
    confirmationMessages: [],
    userId: winner.userId,
  });
};

export const tickCountdownInState = (
  state: GiveawaySessionState,
): GiveawaySessionState => {
  if (!state.isCountdownActive || !state.pendingWinner) {
    return state;
  }

  if (state.countdownSeconds <= 1) {
    return confirmWinnerInState(state, state.pendingWinner.username, {
      confirmedAt: null,
      showConfetti: false,
      noShow: true,
      confirmationMessages: [],
    });
  }

  return {
    ...state,
    countdownSeconds: state.countdownSeconds - 1,
  };
};

export const clearConfettiInState = (
  state: GiveawaySessionState,
): GiveawaySessionState => ({
  ...state,
  showConfetti: false,
});

export const getConfettiClearDelayMs = (): number => CONFETTI_DURATION_MS;
