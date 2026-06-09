import { DEFAULT_OVERLAY_LAYOUT } from "@/overlay/overlayLayout.constants";
import type { OverlayLayoutSettings } from "@/overlay/overlayLayout.types";

type OverlayElementPositions = Pick<
  OverlayLayoutSettings,
  | "wheelPosition"
  | "confirmationPosition"
  | "winnerPosition"
  | "noShowPosition"
  | "participantsPosition"
>;

export interface OverlayLayoutPreset {
  id: string;
  label: string;
  description: string;
  positions: OverlayElementPositions;
}

const allAt = (
  anchor: OverlayElementPositions["wheelPosition"],
): OverlayElementPositions => ({
  wheelPosition: anchor,
  confirmationPosition: anchor,
  winnerPosition: anchor,
  noShowPosition: anchor,
  participantsPosition: anchor,
});

export const OVERLAY_LAYOUT_PRESETS: ReadonlyArray<OverlayLayoutPreset> = [
  {
    id: "default",
    label: "Default",
    description: "Balanced layout for most streams",
    positions: {
      wheelPosition: DEFAULT_OVERLAY_LAYOUT.wheelPosition,
      confirmationPosition: DEFAULT_OVERLAY_LAYOUT.confirmationPosition,
      winnerPosition: DEFAULT_OVERLAY_LAYOUT.winnerPosition,
      noShowPosition: DEFAULT_OVERLAY_LAYOUT.noShowPosition,
      participantsPosition: DEFAULT_OVERLAY_LAYOUT.participantsPosition,
    },
  },
  {
    id: "all-center",
    label: "All center",
    description: "Stack every element in the middle",
    positions: allAt("center"),
  },
  {
    id: "top-right",
    label: "Top right",
    description: "Keep overlays out of the main gameplay area",
    positions: allAt("top-right"),
  },
  {
    id: "top-left",
    label: "Top left",
    description: "Mirror layout for left-side HUDs",
    positions: allAt("top-left"),
  },
  {
    id: "bottom-right",
    label: "Bottom right",
    description: "Classic corner chat-adjacent layout",
    positions: allAt("bottom-right"),
  },
  {
    id: "spread",
    label: "Spread",
    description: "Separate draw, results, and participants",
    positions: {
      wheelPosition: "center",
      confirmationPosition: "top-center",
      winnerPosition: "center",
      noShowPosition: "center",
      participantsPosition: "bottom-left",
    },
  },
];
