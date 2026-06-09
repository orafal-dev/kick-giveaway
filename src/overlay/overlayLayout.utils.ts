import {
  DEFAULT_OVERLAY_LAYOUT,
  MAX_RESULT_DISMISS_SECONDS,
  MIN_RESULT_DISMISS_SECONDS,
  OVERLAY_ANCHOR_FROM_CODE,
  OVERLAY_ANCHOR_CODES,
} from "@/overlay/overlayLayout.constants";
import type {
  OverlayAnchor,
  OverlayLayoutSettings,
} from "@/overlay/overlayLayout.types";

const OVERLAY_LAYOUT_STORAGE_KEY = "kickaway-overlay-layout";

const parseAnchorParam = (
  value: string | null | undefined,
  fallback: OverlayAnchor,
): OverlayAnchor => {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized in OVERLAY_ANCHOR_FROM_CODE) {
    return OVERLAY_ANCHOR_FROM_CODE[normalized]!;
  }

  if (
    normalized === "top-left" ||
    normalized === "top-center" ||
    normalized === "top-right" ||
    normalized === "center-left" ||
    normalized === "center" ||
    normalized === "center-right" ||
    normalized === "bottom-left" ||
    normalized === "bottom-center" ||
    normalized === "bottom-right"
  ) {
    return normalized;
  }

  return fallback;
};

const parseDismissParam = (value: string | null | undefined): number => {
  if (!value) {
    return DEFAULT_OVERLAY_LAYOUT.resultDismissSeconds;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return DEFAULT_OVERLAY_LAYOUT.resultDismissSeconds;
  }

  return Math.min(
    MAX_RESULT_DISMISS_SECONDS,
    Math.max(MIN_RESULT_DISMISS_SECONDS, parsed),
  );
};

export const parseOverlayLayoutSearchParams = (
  params: Record<string, string | undefined>,
): OverlayLayoutSettings => ({
  wheelPosition: parseAnchorParam(
    params.wheel,
    DEFAULT_OVERLAY_LAYOUT.wheelPosition,
  ),
  confirmationPosition: parseAnchorParam(
    params.confirm,
    DEFAULT_OVERLAY_LAYOUT.confirmationPosition,
  ),
  winnerPosition: parseAnchorParam(
    params.winner,
    DEFAULT_OVERLAY_LAYOUT.winnerPosition,
  ),
  noShowPosition: parseAnchorParam(
    params.noshow,
    DEFAULT_OVERLAY_LAYOUT.noShowPosition,
  ),
  participantsPosition: parseAnchorParam(
    params.participants,
    DEFAULT_OVERLAY_LAYOUT.participantsPosition,
  ),
  resultDismissSeconds: parseDismissParam(params.dismiss),
});

export const appendOverlayLayoutToSearchParams = (
  params: URLSearchParams,
  layout: OverlayLayoutSettings,
): void => {
  params.set("wheel", OVERLAY_ANCHOR_CODES[layout.wheelPosition]);
  params.set("confirm", OVERLAY_ANCHOR_CODES[layout.confirmationPosition]);
  params.set("winner", OVERLAY_ANCHOR_CODES[layout.winnerPosition]);
  params.set("noshow", OVERLAY_ANCHOR_CODES[layout.noShowPosition]);
  params.set("participants", OVERLAY_ANCHOR_CODES[layout.participantsPosition]);
  params.set("dismiss", String(layout.resultDismissSeconds));
};

export const loadStoredOverlayLayout = (): OverlayLayoutSettings => {
  if (typeof window === "undefined") {
    return { ...DEFAULT_OVERLAY_LAYOUT };
  }

  const raw = window.sessionStorage.getItem(OVERLAY_LAYOUT_STORAGE_KEY);
  if (!raw) {
    return { ...DEFAULT_OVERLAY_LAYOUT };
  }

  try {
    return parseOverlayLayoutSearchParams(
      JSON.parse(raw) as Record<string, string | undefined>,
    );
  } catch {
    return { ...DEFAULT_OVERLAY_LAYOUT };
  }
};

export const saveStoredOverlayLayout = (layout: OverlayLayoutSettings): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    OVERLAY_LAYOUT_STORAGE_KEY,
    JSON.stringify({
      wheel: OVERLAY_ANCHOR_CODES[layout.wheelPosition],
      confirm: OVERLAY_ANCHOR_CODES[layout.confirmationPosition],
      winner: OVERLAY_ANCHOR_CODES[layout.winnerPosition],
      noshow: OVERLAY_ANCHOR_CODES[layout.noShowPosition],
      participants: OVERLAY_ANCHOR_CODES[layout.participantsPosition],
      dismiss: String(layout.resultDismissSeconds),
    }),
  );
};

export const getOverlayAnchorClassName = (anchor: OverlayAnchor): string => {
  const anchorClasses: Record<OverlayAnchor, string> = {
    "top-left": "items-start justify-start",
    "top-center": "items-start justify-center",
    "top-right": "items-start justify-end",
    "center-left": "items-center justify-start",
    center: "items-center justify-center",
    "center-right": "items-center justify-end",
    "bottom-left": "items-end justify-start",
    "bottom-center": "items-end justify-center",
    "bottom-right": "items-end justify-end",
  };

  return anchorClasses[anchor];
};

export const isOverlayLayoutEqual = (
  left: OverlayLayoutSettings,
  right: OverlayLayoutSettings,
): boolean =>
  left.wheelPosition === right.wheelPosition &&
  left.confirmationPosition === right.confirmationPosition &&
  left.winnerPosition === right.winnerPosition &&
  left.noShowPosition === right.noShowPosition &&
  left.participantsPosition === right.participantsPosition &&
  left.resultDismissSeconds === right.resultDismissSeconds;
