import type { AnimationMode, Entrant } from "@/giveaway/giveaway.types";

export interface OverlayDrawSnapshot {
  sessionId: number;
  drawTarget: Entrant;
  drawPool: Entrant[];
  animationMode: AnimationMode;
  animationDurationSeconds: number;
}
