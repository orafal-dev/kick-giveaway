import { useEffect, useMemo, useRef } from "react";
import {
  buildOverlayPayload,
  type BuildOverlayPayloadInput,
} from "@/overlay/buildOverlayPayload";
import {
  publishOverlayStateLocal,
  publishOverlayStateRemote,
  subscribeOverlayStateLocal,
} from "@/overlay/overlaySync";

const REMOTE_PUBLISH_DEBOUNCE_MS = 500;

type UseOverlayBroadcastInput = BuildOverlayPayloadInput & {
  sessionId: string;
};

export const useOverlayBroadcast = (input: UseOverlayBroadcastInput): string => {
  const { sessionId, ...payloadInput } = input;
  const remotePublishTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const latestWinner = payloadInput.winners.at(-1);

  const payload = useMemo(
    () => buildOverlayPayload(payloadInput),
    [
      payloadInput.channelName,
      payloadInput.giveawayStarted,
      payloadInput.settings.animationMode,
      payloadInput.settings.animationDurationSeconds,
      payloadInput.settings.winnerConfirmationEnabled,
      payloadInput.isDrawing,
      payloadInput.drawTarget?.userId,
      payloadInput.drawPool.length,
      payloadInput.displayName,
      payloadInput.pendingWinner?.userId,
      payloadInput.pendingWinner?.startedAt,
      payloadInput.countdownSeconds,
      payloadInput.isCountdownActive,
      payloadInput.showConfetti,
      payloadInput.drawCount,
      payloadInput.winners.length,
      latestWinner?.noShow,
      latestWinner?.username,
      payloadInput.layout.wheelPosition,
      payloadInput.layout.confirmationPosition,
      payloadInput.layout.winnerPosition,
      payloadInput.layout.noShowPosition,
      payloadInput.layout.resultDismissSeconds,
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
