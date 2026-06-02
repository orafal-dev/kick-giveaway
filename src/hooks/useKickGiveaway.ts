import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { KickChatMessage } from "@/App.types";
import { devMode } from "@/config/devMode";
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
  WinnerConfirmationMessage,
  WinnerRecord,
} from "@/giveaway/giveaway.types";
import {
  appendConfirmationMessage,
  createWinnerChatCapture,
  isMessageFromPendingWinner,
  isMessageFromWinnerChatCapture,
  toConfirmationMessage,
  type WinnerChatCapture,
} from "@/giveaway/winnerChatMessages";
import { pickWeightedWinner, normalizeValue } from "@/services/drawUtils";
import { fetchKickChannelInfo } from "@/services/kickApi";
import {
  createMockKickMessages,
  seedEntrantsFromMockMessages,
} from "@/services/devMockEntrants";
import { getEligibleDrawPool, tryAddEntrant } from "@/services/kickEntrants";
import { KickWebSocketManager } from "@/services/kickWebSocket";

export const useKickGiveaway = () => {
  const [isPersistenceReady, setIsPersistenceReady] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [settings, setSettings] = useState<GiveawaySettings>({
    ...DEFAULT_SETTINGS,
  });
  const [entrants, setEntrants] = useState<Entrant[]>([]);
  const [winners, setWinners] = useState<WinnerRecord[]>([]);
  const [phase, setPhase] = useState<GiveawayPhase>("idle");
  const [pendingWinner, setPendingWinner] = useState<PendingWinner | null>(null);
  const [drawCount, setDrawCount] = useState(0);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("idle");
  const [isChannelStepComplete, setIsChannelStepComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [channelModeMessage, setChannelModeMessage] = useState("");
  const [channelSubscribersOnly, setChannelSubscribersOnly] = useState(false);
  const [lastMessages, setLastMessages] = useState<KickChatMessage[]>([]);
  const [pendingWinnerMessages, setPendingWinnerMessages] = useState<
    WinnerConfirmationMessage[]
  >([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawTarget, setDrawTarget] = useState<Entrant | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(
    DEFAULT_SETTINGS.confirmTimeSeconds,
  );
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [giveawayStarted, setGiveawayStarted] = useState(false);

  const wsRef = useRef<KickWebSocketManager | null>(null);
  const settingsRef = useRef(settings);
  const pendingWinnerRef = useRef(pendingWinner);
  const pendingWinnerMessagesRef = useRef(pendingWinnerMessages);
  const winnerChatCaptureRef = useRef<WinnerChatCapture | null>(null);
  const countdownActiveRef = useRef(isCountdownActive);
  const confettiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelSubscribersOnlyRef = useRef(channelSubscribersOnly);
  const giveawayStartedRef = useRef(giveawayStarted);
  const phaseRef = useRef(phase);

  const channelLabel = useMemo(
    () => normalizeValue(channelName),
    [channelName],
  );
  const drawPool = useMemo(
    () => getEligibleDrawPool(entrants, winners),
    [entrants, winners],
  );
  const acceptedWinnersCount = useMemo(
    () => winners.filter((winner) => !winner.noShow).length,
    [winners],
  );
  const winnersTargetReached =
    acceptedWinnersCount >= settings.winnersCount;

  useLayoutEffect(() => {
    const persisted = loadPersistedState();
    if (persisted) {
      setChannelName(persisted.channelName);
      setSettings(persisted.settings);
      setEntrants(persisted.entrants);
      setWinners(persisted.winners);
      setPhase(persisted.phase);
      setPendingWinner(persisted.pendingWinner);
      setDrawCount(persisted.drawCount);
      setCountdownSeconds(persisted.settings.confirmTimeSeconds);
      setIsChannelStepComplete(Boolean(persisted.channelName.trim()));
    }

    setIsPersistenceReady(true);
  }, []);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    pendingWinnerRef.current = pendingWinner;
  }, [pendingWinner]);

  useEffect(() => {
    pendingWinnerMessagesRef.current = pendingWinnerMessages;
  }, [pendingWinnerMessages]);

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
    if (!isPersistenceReady) {
      return;
    }

    savePersistedState({
      channelName,
      settings,
      entrants,
      winners,
      phase,
      pendingWinner,
      drawCount,
    });
  }, [
    isPersistenceReady,
    channelName,
    settings,
    entrants,
    winners,
    phase,
    pendingWinner,
    drawCount,
  ]);

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

  const appendCapturedWinnerMessage = useCallback(
    (chatMessage: KickChatMessage): WinnerConfirmationMessage[] | null => {
      const capture = winnerChatCaptureRef.current;
      if (!capture || Date.now() > capture.captureUntil) {
        if (capture && Date.now() > capture.captureUntil) {
          winnerChatCaptureRef.current = null;
        }
        return null;
      }

      if (!isMessageFromWinnerChatCapture(chatMessage, capture)) {
        return null;
      }

      const entry = toConfirmationMessage(chatMessage);

      if (pendingWinnerRef.current) {
        const nextMessages = appendConfirmationMessage(
          pendingWinnerMessagesRef.current,
          entry,
        );
        pendingWinnerMessagesRef.current = nextMessages;
        setPendingWinnerMessages(nextMessages);
        return nextMessages;
      }

      setWinners((previousWinners) =>
        previousWinners.map((winner) => {
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
      );

      return null;
    },
    [],
  );

  const confirmWinner = useCallback(
    (
      username: string,
      options: {
        confirmedAt?: number | null;
        showConfetti?: boolean;
        noShow?: boolean;
        confirmationMessages?: WinnerConfirmationMessage[];
        userId?: string;
      } = {},
    ): void => {
      const {
        confirmedAt = Date.now(),
        showConfetti = true,
        noShow = false,
        confirmationMessages = pendingWinnerMessagesRef.current,
        userId = pendingWinnerRef.current?.userId ?? username,
      } = options;

      setWinners((previousWinners) => {
        const alreadyRecorded = previousWinners.some(
          (winner) =>
            normalizeValue(winner.username) === normalizeValue(username),
        );

        if (alreadyRecorded) {
          return previousWinners;
        }

        const nextWinners = [
          ...previousWinners,
          {
            username,
            userId,
            confirmedAt,
            noShow,
            drawIndex: previousWinners.length + 1,
            confirmationMessages: noShow ? [] : [...confirmationMessages],
          },
        ];

        const acceptedCount = nextWinners.filter(
          (winner) => !winner.noShow,
        ).length;
        setPhase(
          acceptedCount >= settingsRef.current.winnersCount
            ? "completed"
            : "collecting",
        );

        return nextWinners;
      });

      const pending = pendingWinnerRef.current;
      if (!noShow && pending) {
        winnerChatCaptureRef.current = createWinnerChatCapture(
          userId,
          username,
          pending.startedAt,
          settingsRef.current.confirmTimeSeconds,
        );
      } else {
        winnerChatCaptureRef.current = null;
      }

      setPendingWinner(null);
      pendingWinnerRef.current = null;
      setPendingWinnerMessages([]);
      pendingWinnerMessagesRef.current = [];
      countdownActiveRef.current = false;
      setIsCountdownActive(false);

      if (!showConfetti) {
        return;
      }

      setShowConfetti(true);

      if (confettiTimeoutRef.current) {
        clearTimeout(confettiTimeoutRef.current);
      }

      confettiTimeoutRef.current = setTimeout(() => {
        setShowConfetti(false);
        confettiTimeoutRef.current = null;
      }, CONFETTI_DURATION_MS);
    },
    [],
  );

  const handleConfettiComplete = useCallback((): void => {
    if (confettiTimeoutRef.current) {
      clearTimeout(confettiTimeoutRef.current);
      confettiTimeoutRef.current = null;
    }

    setShowConfetti(false);
  }, []);

  const seedDevEntrantsIfEnabled = useCallback((): void => {
    if (!devMode.enabled) {
      return;
    }

    const keyword = settingsRef.current.keyword;
    const messages = createMockKickMessages(devMode.mockEntrantCount, keyword);

    setEntrants((previousEntrants) =>
      seedEntrantsFromMockMessages(
        previousEntrants,
        messages,
        settingsRef.current,
        channelSubscribersOnlyRef.current,
      ),
    );
  }, []);

  const handleKickMessage = useCallback(
    (chatMessage: KickChatMessage): void => {
      const cutoff = Date.now() - RECENT_MESSAGES_RETENTION_MS;
      setLastMessages((previousMessages) =>
        [chatMessage, ...previousMessages]
          .filter((message) => message.timestamp >= cutoff)
          .slice(0, RECENT_MESSAGES_LIMIT),
      );

      if (winnerChatCaptureRef.current || pendingWinnerRef.current) {
        appendCapturedWinnerMessage(chatMessage);
      }

      const pending = pendingWinnerRef.current;
      if (
        countdownActiveRef.current &&
        pending &&
        isMessageFromPendingWinner(chatMessage, pending)
      ) {
        confirmWinner(pending.username, {
          confirmationMessages: pendingWinnerMessagesRef.current,
        });
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
    [appendCapturedWinnerMessage, confirmWinner],
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
      const { chatroomId, channelId, subscribersOnlyMode } =
        await fetchKickChannelInfo(channelLabel);

      setChannelSubscribersOnly(subscribersOnlyMode);

      if (wsRef.current) {
        wsRef.current.disconnect();
      }

      const manager = new KickWebSocketManager([...KICK_WS_URLS]);
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
        if (giveawayStartedRef.current) {
          setPhase("collecting");
          seedDevEntrantsIfEnabled();
          return;
        }

        setPhase("idle");
      });

      manager.connect(chatroomId, channelId);
      return true;
    } catch (error) {
      setConnectionStatus("idle");
      setPhase("idle");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to connect to channel.",
      );
      return false;
    }
  }, [
    channelLabel,
    giveawayStarted,
    handleKickMessage,
    seedDevEntrantsIfEnabled,
  ]);

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
    seedDevEntrantsIfEnabled();
  }, [
    channelLabel,
    connectToChannel,
    connectionStatus,
    seedDevEntrantsIfEnabled,
  ]);

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
    setPendingWinnerMessages([]);
    winnerChatCaptureRef.current = null;
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
    setPendingWinnerMessages([]);
    winnerChatCaptureRef.current = null;
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
    setGiveawayStarted(false);
    setPhase("idle");
    setEntrants([]);
    setWinners([]);
    setPendingWinner(null);
    pendingWinnerRef.current = null;
    setPendingWinnerMessages([]);
    pendingWinnerMessagesRef.current = [];
    winnerChatCaptureRef.current = null;
    setDrawCount(0);
    setIsDrawing(false);
    setDrawTarget(null);
    setDisplayName("");
    setShowConfetti(false);
    if (confettiTimeoutRef.current) {
      clearTimeout(confettiTimeoutRef.current);
      confettiTimeoutRef.current = null;
    }
    countdownActiveRef.current = false;
    setIsCountdownActive(false);
    setCountdownSeconds(settings.confirmTimeSeconds);
  }, [settings.confirmTimeSeconds]);

  const finalizeDraw = useCallback(
    (winner: Entrant): void => {
      setDisplayName(winner.username);
      setIsDrawing(false);
      setDrawTarget(null);
      setDrawCount((previous) => previous + 1);

      if (settingsRef.current.winnerConfirmationEnabled) {
        const startedAt = Date.now();
        setPendingWinnerMessages([]);
        pendingWinnerMessagesRef.current = [];
        winnerChatCaptureRef.current = createWinnerChatCapture(
          winner.userId,
          winner.username,
          startedAt,
          settingsRef.current.confirmTimeSeconds,
        );
        setPendingWinner({
          username: winner.username,
          userId: winner.userId,
          startedAt,
        });
        pendingWinnerRef.current = {
          username: winner.username,
          userId: winner.userId,
          startedAt,
        };
        setCountdownSeconds(settingsRef.current.confirmTimeSeconds);
        countdownActiveRef.current = true;
        setIsCountdownActive(true);
        setPhase("awaitingConfirmation");
        return;
      }

      confirmWinner(winner.username, {
        confirmedAt: null,
        showConfetti: true,
        noShow: false,
        confirmationMessages: [],
      });
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
    winnerChatCaptureRef.current = null;
  }, [drawPool, isDrawing, winnersTargetReached]);

  const handleManualConfirm = useCallback((): void => {
    if (!pendingWinner) {
      return;
    }

    confirmWinner(pendingWinner.username, {
      confirmationMessages: [...pendingWinnerMessagesRef.current],
    });
  }, [confirmWinner, pendingWinner]);

  const handleDisconnect = useCallback((): void => {
    wsRef.current?.disconnect();
    wsRef.current = null;
    setConnectionStatus("idle");
    setPhase("idle");
    setGiveawayStarted(false);
  }, []);

  const updateSettings = useCallback(
    (partial: Partial<GiveawaySettings>): void => {
      setSettings((previous) => ({ ...previous, ...partial }));
    },
    [],
  );

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
            confirmWinner(pendingWinnerRef.current.username, {
              confirmedAt: null,
              showConfetti: false,
              noShow: true,
              confirmationMessages: [],
            });
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
    if (connectionStatus !== "connected") {
      return;
    }

    const manager = wsRef.current;
    if (!manager) {
      return;
    }

    wsRef.current = manager;

    return () => {
      manager.disconnect();
      if (wsRef.current === manager) {
        wsRef.current = null;
      }
    };
  }, [connectionStatus]);

  useEffect(() => {
    if (!showConfetti) {
      return;
    }

    const confettiTimeout = confettiTimeoutRef.current;
    confettiTimeoutRef.current = confettiTimeout;

    return () => {
      if (confettiTimeout) {
        clearTimeout(confettiTimeout);
        confettiTimeoutRef.current = null;
      }
    };
  }, [showConfetti]);

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
    isPersistenceReady,
    isChannelStepComplete,
    errorMessage,
    channelModeMessage,
    lastMessages,
    pendingWinnerMessages,
    isDrawing,
    drawTarget,
    setDrawTarget,
    displayName,
    setDisplayName,
    showConfetti,
    handleConfettiComplete,
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
    devModeEnabled: devMode.enabled,
    devMockEntrantCount: devMode.mockEntrantCount,
  };
};
