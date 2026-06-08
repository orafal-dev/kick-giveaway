import { useOpenPanel } from "@openpanel/nextjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildGiveawayStartedProperties } from "@/analytics/giveaway-events";
import { openpanelConfig } from "@/config/openpanel";
import { devMode } from "@/config/devMode";
import { DEFAULT_SETTINGS } from "@/giveaway/giveaway.constants";
import { getConfirmationCountdownSeconds } from "@/giveaway/confirmationCountdown.utils";
import {
  clearPersistedState,
  loadPersistedState,
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
import { getEligibleDrawPool } from "@/services/kickEntrants";
import { normalizeValue } from "@/services/drawUtils";
import type { KickChatMessage } from "@/App.types";
import type { GiveawaySessionState } from "@/server/giveaway/giveawaySession.types";
import { fetchKickChannelInfo } from "@/services/kickApi";
import { toChannelSessionPatch } from "@/services/kickApi.types";
import {
  ensureGiveawaySession,
  fetchGiveawaySession,
  finalizeGiveawayDraw,
  getGiveawaySessionEventsUrl,
  patchGiveawaySession,
  runGiveawaySessionAction,
  updateGiveawayDrawingDisplay,
} from "@/services/giveawaySessionApi";

const HEARTBEAT_INTERVAL_MS = 30_000;
const SETTINGS_SYNC_DEBOUNCE_MS = 400;

const applySessionState = (
  setters: {
    setChannelName: (value: string) => void;
    setSettings: (value: GiveawaySettings) => void;
    setEntrants: (value: Entrant[]) => void;
    setWinners: (value: WinnerRecord[]) => void;
    setPhase: (value: GiveawayPhase) => void;
    setPendingWinner: (value: PendingWinner | null) => void;
    setDrawCount: (value: number) => void;
    setConnectionStatus: (value: ConnectionStatus) => void;
    setErrorMessage: (value: string) => void;
    setChannelModeMessage: (value: string) => void;
    setLastMessages: (value: KickChatMessage[]) => void;
    setPendingWinnerMessages: (value: WinnerConfirmationMessage[]) => void;
    setIsDrawing: (value: boolean) => void;
    setDrawTarget: (value: Entrant | null) => void;
    setDisplayName: (value: string) => void;
    setShowConfetti: (value: boolean) => void;
    setCountdownSeconds: (value: number) => void;
    setIsCountdownActive: (value: boolean) => void;
    setGiveawayStarted: (value: boolean) => void;
    setChannelSubscribersOnly: (value: boolean) => void;
  },
  state: GiveawaySessionState,
): void => {
  setters.setChannelName(state.channelName);
  setters.setSettings(state.settings);
  setters.setEntrants(state.entrants);
  setters.setWinners(state.winners);
  setters.setPhase(state.phase);
  setters.setPendingWinner(state.pendingWinner);
  setters.setDrawCount(state.drawCount);
  setters.setConnectionStatus(state.connectionStatus);
  setters.setErrorMessage(state.errorMessage);
  setters.setChannelModeMessage(state.channelModeMessage);
  setters.setLastMessages(state.lastMessages);
  setters.setPendingWinnerMessages(state.pendingWinnerMessages);
  setters.setIsDrawing(state.isDrawing);
  setters.setDrawTarget(state.drawTarget);
  setters.setDisplayName(state.displayName);
  setters.setShowConfetti(state.showConfetti);
  setters.setCountdownSeconds(state.countdownSeconds);
  setters.setIsCountdownActive(state.isCountdownActive);
  setters.setGiveawayStarted(state.giveawayStarted);
  setters.setChannelSubscribersOnly(state.channelSubscribersOnly);
};

const getPersistedBootstrap = () => {
  const persisted = loadPersistedState();

  if (!persisted) {
    return null;
  }

  return {
    channelName: persisted.channelName,
    settings: persisted.settings,
    countdownSeconds: persisted.settings.confirmTimeSeconds,
    isChannelStepComplete: Boolean(persisted.channelName.trim()),
  };
};

export const useKickGiveaway = (sessionId: string) => {
  const op = useOpenPanel();
  const [persistedBootstrap] = useState(getPersistedBootstrap);
  const [isPersistenceReady] = useState(true);
  const [isServerReady, setIsServerReady] = useState(false);
  const [serverUnavailable, setServerUnavailable] = useState(false);
  const [channelName, setChannelName] = useState(
    () => persistedBootstrap?.channelName ?? "",
  );
  const [settings, setSettings] = useState<GiveawaySettings>(
    () => persistedBootstrap?.settings ?? { ...DEFAULT_SETTINGS },
  );
  const [entrants, setEntrants] = useState<Entrant[]>([]);
  const [winners, setWinners] = useState<WinnerRecord[]>([]);
  const [phase, setPhase] = useState<GiveawayPhase>("idle");
  const [pendingWinner, setPendingWinner] = useState<PendingWinner | null>(null);
  const [drawCount, setDrawCount] = useState(0);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("idle");
  const [isChannelStepComplete, setIsChannelStepComplete] = useState(
    () => persistedBootstrap?.isChannelStepComplete ?? false,
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [channelModeMessage, setChannelModeMessage] = useState("");
  const [, setChannelSubscribersOnly] = useState(false);
  const [lastMessages, setLastMessages] = useState<KickChatMessage[]>([]);
  const [pendingWinnerMessages, setPendingWinnerMessages] = useState<
    WinnerConfirmationMessage[]
  >([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawTarget, setDrawTarget] = useState<Entrant | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(
    () =>
      persistedBootstrap?.countdownSeconds ??
      DEFAULT_SETTINGS.confirmTimeSeconds,
  );
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [giveawayStarted, setGiveawayStarted] = useState(false);

  const latestUpdatedAtRef = useRef(0);
  const settingsSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const hasTrackedGiveawayStartRef = useRef(false);
  const channelNameRef = useRef(channelName);
  const settingsRef = useRef(settings);

  const stateSetters = useMemo(
    () => ({
      setChannelName,
      setSettings,
      setEntrants,
      setWinners,
      setPhase,
      setPendingWinner,
      setDrawCount,
      setConnectionStatus,
      setErrorMessage,
      setChannelModeMessage,
      setLastMessages,
      setPendingWinnerMessages,
      setIsDrawing,
      setDrawTarget,
      setDisplayName,
      setShowConfetti,
      setCountdownSeconds,
      setIsCountdownActive,
      setGiveawayStarted,
      setChannelSubscribersOnly,
    }),
    [],
  );

  const applyServerState = useCallback(
    (state: GiveawaySessionState): void => {
      if (state.updatedAt < latestUpdatedAtRef.current) {
        return;
      }

      latestUpdatedAtRef.current = state.updatedAt;

      const localChannelName = channelNameRef.current.trim();
      const mergedState =
        state.channelName.trim() || !localChannelName
          ? state
          : { ...state, channelName: localChannelName };

      applySessionState(stateSetters, mergedState);
    },
    [stateSetters],
  );

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

  useEffect(() => {
    channelNameRef.current = channelName;
  }, [channelName]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    if (!isCountdownActive || !pendingWinner) {
      return;
    }

    const { startedAt } = pendingWinner;
    const confirmTimeSeconds = settings.confirmTimeSeconds;

    const tick = (): void => {
      setCountdownSeconds(
        getConfirmationCountdownSeconds(startedAt, confirmTimeSeconds),
      );
    };

    tick();
    const intervalId = setInterval(tick, 250);

    return () => {
      clearInterval(intervalId);
    };
  }, [isCountdownActive, pendingWinner, settings.confirmTimeSeconds]);

  useEffect(() => {
    if (!isPersistenceReady || !sessionId) {
      return;
    }

    let cancelled = false;

    const bootstrap = async (): Promise<void> => {
      try {
        const { state } = await ensureGiveawaySession({
          sessionId,
          channelName: channelNameRef.current,
          settings: settingsRef.current,
        });

        if (cancelled) {
          return;
        }

        applyServerState(state);
        setIsChannelStepComplete(Boolean(state.channelName.trim()));
        setServerUnavailable(false);
        setIsServerReady(true);

        if (
          state.giveawayStarted ||
          state.connectionStatus !== "idle" ||
          Boolean(state.chatroomId)
        ) {
          try {
            const { state: syncedState } = await runGiveawaySessionAction(
              sessionId,
              "sync",
            );
            if (!cancelled) {
              applyServerState(syncedState);
              setIsChannelStepComplete(
                Boolean(syncedState.channelName.trim()),
              );
            }
          } catch {
            // Collector will catch up; SSE may deliver updates shortly.
          }
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        setServerUnavailable(true);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Server-side giveaway is unavailable.",
        );
        setIsServerReady(true);
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [applyServerState, isPersistenceReady, sessionId]);

  useEffect(() => {
    if (!sessionId || !isServerReady || serverUnavailable) {
      return;
    }

    const source = new EventSource(getGiveawaySessionEventsUrl(sessionId));

    source.onmessage = (event) => {
      try {
        const state = JSON.parse(event.data) as GiveawaySessionState;
        applyServerState(state);
      } catch {
        // Ignore malformed SSE payloads.
      }
    };

    source.onerror = () => {
      setErrorMessage((previous) =>
        previous || "Lost connection to giveaway session updates.",
      );
    };

    return () => {
      source.close();
    };
  }, [applyServerState, isServerReady, serverUnavailable, sessionId]);

  useEffect(() => {
    if (!sessionId || !isServerReady || serverUnavailable) {
      return;
    }

    const heartbeatId = setInterval(() => {
      void runGiveawaySessionAction(sessionId, "heartbeat").catch(() => {});
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      clearInterval(heartbeatId);
    };
  }, [isServerReady, serverUnavailable, sessionId]);

  useEffect(() => {
    if (!sessionId || !isServerReady || serverUnavailable) {
      return;
    }

    if (settingsSyncTimeoutRef.current) {
      clearTimeout(settingsSyncTimeoutRef.current);
    }

    settingsSyncTimeoutRef.current = setTimeout(() => {
      void patchGiveawaySession(sessionId, {
        channelName: channelNameRef.current,
        settings: settingsRef.current,
      }).catch(() => {});
    }, SETTINGS_SYNC_DEBOUNCE_MS);

    return () => {
      if (settingsSyncTimeoutRef.current) {
        clearTimeout(settingsSyncTimeoutRef.current);
      }
    };
  }, [channelName, isServerReady, serverUnavailable, sessionId, settings]);

  const trackGiveawayStarted = useCallback((): void => {
    if (!openpanelConfig.enabled || hasTrackedGiveawayStartRef.current) {
      return;
    }

    if (!channelLabel) {
      return;
    }

    hasTrackedGiveawayStartRef.current = true;
    op.track(
      "giveaway_started",
      buildGiveawayStartedProperties(channelLabel, settingsRef.current),
    );
  }, [channelLabel, op]);

  const resetGiveawayStartTracking = useCallback((): void => {
    hasTrackedGiveawayStartRef.current = false;
  }, []);

  const resolveChannelMetadata = useCallback(async (): Promise<boolean> => {
    if (!channelLabel || !sessionId || serverUnavailable) {
      return false;
    }

    try {
      const channelInfo = await fetchKickChannelInfo(channelLabel);
      const { state } = await patchGiveawaySession(
        sessionId,
        toChannelSessionPatch(channelNameRef.current, channelInfo),
      );
      applyServerState(state);
      return true;
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to resolve Kick channel.",
      );
      return false;
    }
  }, [applyServerState, channelLabel, serverUnavailable, sessionId]);

  const runAction = useCallback(
    async (
      action: Parameters<typeof runGiveawaySessionAction>[1],
      payload: Record<string, unknown> = {},
    ): Promise<void> => {
      if (!sessionId || serverUnavailable) {
        return;
      }

      const { state } = await runGiveawaySessionAction(
        sessionId,
        action,
        payload,
      );
      applyServerState(state);
    },
    [applyServerState, serverUnavailable, sessionId],
  );

  const handleConfettiComplete = useCallback((): void => {
    void runAction("confetti-complete");
  }, [runAction]);

  const handleStartGiveaway = useCallback(async (): Promise<void> => {
    if (!channelLabel) {
      setErrorMessage("Enter a Kick channel name.");
      return;
    }

    if (sessionId && !serverUnavailable) {
      const { state } = await fetchGiveawaySession(sessionId);
      if (!state.chatroomId) {
        const resolved = await resolveChannelMetadata();
        if (!resolved) {
          return;
        }
      }
    }

    await runAction("start");
    trackGiveawayStarted();
  }, [
    channelLabel,
    resolveChannelMetadata,
    runAction,
    serverUnavailable,
    sessionId,
    trackGiveawayStarted,
  ]);

  const handleChannelLandingSubmit = useCallback(async (): Promise<void> => {
    if (!channelLabel) {
      setErrorMessage("Enter a Kick channel name.");
      return;
    }

    setErrorMessage("");
    setIsChannelStepComplete(true);

    const resolved = await resolveChannelMetadata();
    if (!resolved) {
      setIsChannelStepComplete(false);
      return;
    }

    await runAction("connect");
  }, [channelLabel, resolveChannelMetadata, runAction]);

  const handleChangeChannel = useCallback(async (): Promise<void> => {
    resetGiveawayStartTracking();
    setIsChannelStepComplete(false);
    await runAction("change-channel");
  }, [resetGiveawayStartTracking, runAction]);

  const handleClearAllData = useCallback(async (): Promise<void> => {
    resetGiveawayStartTracking();
    clearPersistedState();
    await runAction("clear");
    setChannelName("");
    setSettings({ ...DEFAULT_SETTINGS });
    setIsChannelStepComplete(false);
  }, [resetGiveawayStartTracking, runAction]);

  const handleReset = useCallback(async (): Promise<void> => {
    resetGiveawayStartTracking();
    await runAction("reset");
  }, [resetGiveawayStartTracking, runAction]);

  const finalizeDraw = useCallback(
    async (winner: Entrant): Promise<void> => {
      if (!sessionId || serverUnavailable) {
        return;
      }

      const { state } = await finalizeGiveawayDraw(sessionId, { winner });
      applyServerState(state);
    },
    [applyServerState, serverUnavailable, sessionId],
  );

  const handleDrawWinner = useCallback(async (): Promise<void> => {
    await runAction("draw");
  }, [runAction]);

  const handleManualConfirm = useCallback(async (): Promise<void> => {
    await runAction("confirm");
  }, [runAction]);

  const handleDisconnect = useCallback(async (): Promise<void> => {
    await runAction("stop");
  }, [runAction]);

  const updateSettings = useCallback(
    (partial: Partial<GiveawaySettings>): void => {
      setSettings((previous) => ({ ...previous, ...partial }));
    },
    [],
  );

  const setDisplayNameOnServer = useCallback(
    async (nextDisplayName: string): Promise<void> => {
      setDisplayName(nextDisplayName);

      if (!sessionId || serverUnavailable) {
        return;
      }

      await updateGiveawayDrawingDisplay(sessionId, {
        displayName: nextDisplayName,
      });
    },
    [serverUnavailable, sessionId],
  );

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
    isPersistenceReady: isPersistenceReady && isServerReady,
    isChannelStepComplete,
    errorMessage,
    channelModeMessage,
    lastMessages,
    pendingWinnerMessages,
    isDrawing,
    drawTarget,
    setDrawTarget,
    displayName,
    setDisplayName: setDisplayNameOnServer,
    showConfetti,
    handleConfettiComplete,
    countdownSeconds,
    isCountdownActive,
    giveawayStarted,
    drawPool,
    winnersTargetReached,
    channelLabel,
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
    serverUnavailable,
    sessionId,
  };
};
