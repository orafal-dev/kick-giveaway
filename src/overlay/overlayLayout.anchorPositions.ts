import type { OverlayAnchor } from "@/overlay/overlayLayout.types";

export const OVERLAY_ANCHORS: ReadonlyArray<OverlayAnchor> = [
  "top-left",
  "top-center",
  "top-right",
  "center-left",
  "center",
  "center-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

/** Percent-based anchor points used by the layout canvas and monitor previews. */
export const OVERLAY_ANCHOR_PERCENT: Record<
  OverlayAnchor,
  { x: number; y: number }
> = {
  "top-left": { x: 12, y: 12 },
  "top-center": { x: 50, y: 12 },
  "top-right": { x: 88, y: 12 },
  "center-left": { x: 12, y: 50 },
  center: { x: 50, y: 50 },
  "center-right": { x: 88, y: 50 },
  "bottom-left": { x: 12, y: 88 },
  "bottom-center": { x: 50, y: 88 },
  "bottom-right": { x: 88, y: 88 },
};

export const findNearestOverlayAnchor = (
  xPercent: number,
  yPercent: number,
): OverlayAnchor => {
  let nearest: OverlayAnchor = "center";
  let minDistance = Number.POSITIVE_INFINITY;

  for (const anchor of OVERLAY_ANCHORS) {
    const point = OVERLAY_ANCHOR_PERCENT[anchor];
    const dx = xPercent - point.x;
    const dy = yPercent - point.y;
    const distance = dx * dx + dy * dy;

    if (distance < minDistance) {
      minDistance = distance;
      nearest = anchor;
    }
  }

  return nearest;
};
