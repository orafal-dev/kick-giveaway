import { useCallback, useEffect, useRef, useState } from "react";
import type { OverlaySyncPayload } from "@/overlay/overlay.types";
import { isOverlayStateEquivalent } from "@/overlay/overlayStateEquality";
import {
  fetchOverlayStateRemote,
  subscribeOverlayStateLocal,
} from "@/overlay/overlaySync";

/** Waiting for the control panel to publish the first overlay state. */
const WAITING_FOR_SYNC_POLL_MS = 2_000;
/** Giveaway running but between draws — overlay is empty. */
const WARM_POLL_INTERVAL_MS = 4_000;
/** Drawing, confetti, or confirmation countdown. */
const HOT_POLL_INTERVAL_MS = 1_000;
/** Idle overlay with a synced session. */
const IDLE_POLL_INTERVAL_MS = 10_000;

const getPollIntervalMs = (state: OverlaySyncPayload | null): number => {
  if (!state) {
    return WAITING_FOR_SYNC_POLL_MS;
  }

  if (
    state.isDrawing ||
    state.showConfetti ||
    (state.isCountdownActive && state.pendingWinner)
  ) {
    return HOT_POLL_INTERVAL_MS;
  }

  if (state.giveawayStarted) {
    return WARM_POLL_INTERVAL_MS;
  }

  return IDLE_POLL_INTERVAL_MS;
};

export const useOverlaySync = (sessionId: string): OverlaySyncPayload | null => {
  const [state, setState] = useState<OverlaySyncPayload | null>(null);
  const latestUpdatedAtRef = useRef(0);
  const stateRef = useRef<OverlaySyncPayload | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollRef = useRef<() => Promise<void>>(async () => {});

  const applyState = useCallback((payload: OverlaySyncPayload): void => {
    if (payload.updatedAt < latestUpdatedAtRef.current) {
      return;
    }

    if (isOverlayStateEquivalent(stateRef.current, payload)) {
      latestUpdatedAtRef.current = payload.updatedAt;
      return;
    }

    latestUpdatedAtRef.current = payload.updatedAt;
    stateRef.current = payload;
    setState(payload);
  }, []);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    let cancelled = false;

    const clearPollTimeout = (): void => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
    };

    const scheduleNextPoll = (delayMs: number): void => {
      clearPollTimeout();
      pollTimeoutRef.current = setTimeout(() => {
        pollTimeoutRef.current = null;
        void pollRef.current();
      }, delayMs);
    };

    const poll = async (): Promise<void> => {
      if (cancelled) {
        return;
      }

      const remoteState = await fetchOverlayStateRemote(sessionId);

      if (cancelled) {
        return;
      }

      if (remoteState) {
        applyState(remoteState);
      }

      scheduleNextPoll(getPollIntervalMs(remoteState ?? stateRef.current));
    };

    pollRef.current = poll;

    const requestImmediatePoll = (): void => {
      clearPollTimeout();
      void poll();
    };

    void poll();

    const unsubscribe = subscribeOverlayStateLocal((payload) => {
      applyState(payload);
      scheduleNextPoll(getPollIntervalMs(payload));
    });

    window.addEventListener("focus", requestImmediatePoll);
    window.addEventListener("pageshow", requestImmediatePoll);
    document.addEventListener("visibilitychange", requestImmediatePoll);

    return () => {
      cancelled = true;
      clearPollTimeout();
      unsubscribe();
      window.removeEventListener("focus", requestImmediatePoll);
      window.removeEventListener("pageshow", requestImmediatePoll);
      document.removeEventListener("visibilitychange", requestImmediatePoll);
    };
  }, [applyState, sessionId]);

  return state;
};
