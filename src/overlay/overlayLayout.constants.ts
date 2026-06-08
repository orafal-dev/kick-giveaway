import type { OverlayAnchor, OverlayLayoutSettings } from "@/overlay/overlayLayout.types";

export const DEFAULT_OVERLAY_LAYOUT: OverlayLayoutSettings = {
  wheelPosition: "center",
  confirmationPosition: "top-center",
  winnerPosition: "center",
  noShowPosition: "center",
  resultDismissSeconds: 8,
};

export const MIN_RESULT_DISMISS_SECONDS = 0;
export const MAX_RESULT_DISMISS_SECONDS = 60;
export const OVERLAY_RESULT_FADE_MS = 600;

export const OVERLAY_ANCHOR_SELECT_ITEMS: ReadonlyArray<{
  label: string;
  value: OverlayAnchor;
}> = [
  { label: "Top left", value: "top-left" },
  { label: "Top center", value: "top-center" },
  { label: "Top right", value: "top-right" },
  { label: "Center left", value: "center-left" },
  { label: "Center", value: "center" },
  { label: "Center right", value: "center-right" },
  { label: "Bottom left", value: "bottom-left" },
  { label: "Bottom center", value: "bottom-center" },
  { label: "Bottom right", value: "bottom-right" },
];

export const OVERLAY_ANCHOR_CODES: Record<OverlayAnchor, string> = {
  "top-left": "tl",
  "top-center": "tc",
  "top-right": "tr",
  "center-left": "cl",
  center: "cc",
  "center-right": "cr",
  "bottom-left": "bl",
  "bottom-center": "bc",
  "bottom-right": "br",
};

export const OVERLAY_ANCHOR_FROM_CODE: Record<string, OverlayAnchor> =
  Object.fromEntries(
    Object.entries(OVERLAY_ANCHOR_CODES).map(([anchor, code]) => [code, anchor]),
  ) as Record<string, OverlayAnchor>;
