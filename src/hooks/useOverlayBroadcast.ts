import { useEffect, useMemo, useRef } from "react";
import {
  buildOverlayPayload,
  type BuildOverlayPayloadInput,
} from "@/overlay/buildOverlayPayload";
import { getOrCreateOverlaySessionId } from "@/overlay/overlaySession";
import {
  publishOverlayStateLocal,
  publishOverlayStateRemote,
  subscribeOverlayStateLocal,
} from "@/overlay/overlaySync";

const REMOTE_PUBLISH_DEBOUNCE_MS = 500;

export const useOverlayBroadcast = (input: BuildOverlayPayloadInput): string => {
  const sessionId = useMemo(() => getOrCreateOverlaySessionId(), []);
  const remotePublishTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const latestWinner = input.winners.at(-1);

  const payload = useMemo(
    () => buildOverlayPayload(input),
    [
      input.channelName,
      input.giveawayStarted,
      input.settings.animationMode,
      input.settings.animationDurationSeconds,
      input.settings.winnerConfirmationEnabled,
      input.isDrawing,
      input.drawTarget?.userId,
      input.drawPool.length,
      input.displayName,
      input.pendingWinner?.userId,
      input.pendingWinner?.startedAt,
      input.countdownSeconds,
      input.isCountdownActive,
      input.showConfetti,
      input.drawCount,
      input.winners.length,
      latestWinner?.noShow,
      latestWinner?.username,
      input.layout.wheelPosition,
      input.layout.confirmationPosition,
      input.layout.winnerPosition,
      input.layout.noShowPosition,
      input.layout.resultDismissSeconds,
    ],
  );

  const payloadRef = useRef(payload);
  payloadRef.current = payload;

  useEffect(() => {
    publishOverlayStateLocal(payload);

    if (remotePublishTimeoutRef.current) {
      clearTimeout(remotePublishTimeoutRef.current);
    }

    remotePublishTimeoutRef.current = setTimeout(() => {
      remotePublishTimeoutRef.current = null;
      void publishOverlayStateRemote(sessionId, payloadRef.current);
    }, REMOTE_PUBLISH_DEBOUNCE_MS);
  }, [payload, sessionId]);

  useEffect(() => {
    const publishNow = (): void => {
      const currentPayload = payloadRef.current;
      publishOverlayStateLocal(currentPayload);
      void publishOverlayStateRemote(sessionId, currentPayload);
    };

    return subscribeOverlayStateLocal(() => {}, publishNow);
  }, [sessionId]);

  useEffect(() => {
    return () => {
      if (remotePublishTimeoutRef.current) {
        clearTimeout(remotePublishTimeoutRef.current);
      }
    };
  }, []);

  return sessionId;
};
