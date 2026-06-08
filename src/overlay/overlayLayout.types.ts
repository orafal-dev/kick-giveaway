export type OverlayAnchor =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface OverlayLayoutSettings {
  wheelPosition: OverlayAnchor;
  confirmationPosition: OverlayAnchor;
  winnerPosition: OverlayAnchor;
  noShowPosition: OverlayAnchor;
  /** Seconds before winner / no-show fade out. 0 = stay until next draw. */
  resultDismissSeconds: number;
}
