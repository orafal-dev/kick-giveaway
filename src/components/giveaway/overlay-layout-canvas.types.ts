import type {
  OverlayAnchor,
  OverlayLayoutSettings,
} from "@/overlay/overlayLayout.types";

export type OverlayCanvasResolution = "1920x1080" | "2560x1440";

export type OverlayCanvasElementKey = keyof Pick<
  OverlayLayoutSettings,
  | "wheelPosition"
  | "confirmationPosition"
  | "winnerPosition"
  | "noShowPosition"
  | "participantsPosition"
>;

export interface OverlayCanvasElementDefinition {
  key: OverlayCanvasElementKey;
  label: string;
  shortLabel: string;
  accentClassName: string;
}

export const OVERLAY_CANVAS_ELEMENTS: ReadonlyArray<OverlayCanvasElementDefinition> =
  [
    {
      key: "wheelPosition",
      label: "Wheel / draw",
      shortLabel: "Draw",
      accentClassName: "border-primary/60 bg-primary/15 text-primary",
    },
    {
      key: "confirmationPosition",
      label: "Confirmation",
      shortLabel: "Confirm",
      accentClassName: "border-amber-500/60 bg-amber-500/15 text-amber-200",
    },
    {
      key: "winnerPosition",
      label: "Winner",
      shortLabel: "Winner",
      accentClassName: "border-kick/60 bg-kick/15 text-kick",
    },
    {
      key: "noShowPosition",
      label: "No show",
      shortLabel: "No show",
      accentClassName: "border-destructive/60 bg-destructive/15 text-destructive",
    },
    {
      key: "participantsPosition",
      label: "Participants",
      shortLabel: "Entries",
      accentClassName: "border-sky-500/60 bg-sky-500/15 text-sky-200",
    },
  ];

export const OVERLAY_CANVAS_RESOLUTIONS: ReadonlyArray<{
  id: OverlayCanvasResolution;
  label: string;
  width: number;
  height: number;
}> = [
  { id: "1920x1080", label: "1080p", width: 1920, height: 1080 },
  { id: "2560x1440", label: "1440p", width: 2560, height: 1440 },
];

export const OVERLAY_SETTLE_DURATION_MS = 280;

export const OVERLAY_SETTLE_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

export type OverlaySettlePhase = "start" | "animate";

export interface OverlaySettlingState {
  key: OverlayCanvasElementKey;
  fromAnchor: OverlayAnchor;
  toAnchor: OverlayAnchor;
  delta: { x: number; y: number };
  phase: OverlaySettlePhase;
}
