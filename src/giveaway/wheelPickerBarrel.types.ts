import type { Entrant } from "@/giveaway/giveaway.types";

/** One visual slot on the wheel (may repeat the same entrant for animation only). */
export interface WheelBarrelSlot {
  entrant: Entrant;
  /** Index in the real participant list (used for display; odds are unchanged). */
  sourceIndex: number;
}
