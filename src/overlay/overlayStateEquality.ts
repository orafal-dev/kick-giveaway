import type { OverlaySyncPayload } from "@/overlay/overlay.types";
import type { OverlayLayoutSettings } from "@/overlay/overlayLayout.types";
import { isOverlayLayoutEqual } from "@/overlay/overlayLayout.utils";

/** Skip React updates when polls only repeat the same overlay-visible state. */
export const isOverlayStateEquivalent = (
  previous: OverlaySyncPayload | null,
  next: OverlaySyncPayload,
): boolean => {
  if (!previous) {
    return false;
  }

  return (
    previous.drawCount === next.drawCount &&
    previous.isDrawing === next.isDrawing &&
    previous.drawTarget?.userId === next.drawTarget?.userId &&
    previous.drawPool.length === next.drawPool.length &&
    previous.displayName === next.displayName &&
    previous.giveawayStarted === next.giveawayStarted &&
    previous.animationMode === next.animationMode &&
    previous.animationDurationSeconds === next.animationDurationSeconds &&
    previous.winnerConfirmationEnabled === next.winnerConfirmationEnabled &&
    previous.pendingWinner?.userId === next.pendingWinner?.userId &&
    previous.pendingWinner?.startedAt === next.pendingWinner?.startedAt &&
    previous.countdownSeconds === next.countdownSeconds &&
    previous.isCountdownActive === next.isCountdownActive &&
    previous.showConfetti === next.showConfetti &&
    previous.latestWinnerNoShow === next.latestWinnerNoShow &&
    isOverlayLayoutEqual(previous.layout, next.layout)
  );
};

export const isOverlayLayoutSettings = (
  value: unknown,
): value is OverlayLayoutSettings => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Record<string, unknown>;
  const anchors = [
    data.wheelPosition,
    data.confirmationPosition,
    data.winnerPosition,
    data.noShowPosition,
  ];

  const isAnchor = (entry: unknown): boolean =>
    typeof entry === "string" &&
    [
      "top-left",
      "top-center",
      "top-right",
      "center-left",
      "center",
      "center-right",
      "bottom-left",
      "bottom-center",
      "bottom-right",
    ].includes(entry);

  return (
    anchors.every(isAnchor) &&
    typeof data.resultDismissSeconds === "number"
  );
};
