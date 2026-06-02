import type { Entrant } from "@/giveaway/giveaway.types";
import type { WheelBarrelSlot } from "@/giveaway/wheelPickerBarrel.types";
import { MIN_WHEEL_BARREL_SLOTS } from "@/giveaway/giveaway.constants";

/**
 * Repeat participants in order until the wheel has at least `minSlots` rows.
 * Visual-only — each slot still maps to one real entrant via `sourceIndex`.
 */
export const buildWheelBarrel = (
  entrants: Entrant[],
  minSlots: number = MIN_WHEEL_BARREL_SLOTS,
): WheelBarrelSlot[] => {
  if (entrants.length === 0) {
    return [];
  }

  if (entrants.length >= minSlots) {
    return entrants.map((entrant, sourceIndex) => ({ entrant, sourceIndex }));
  }

  const barrel: WheelBarrelSlot[] = [];

  while (barrel.length < minSlots) {
    for (let sourceIndex = 0; sourceIndex < entrants.length; sourceIndex++) {
      barrel.push({ entrant: entrants[sourceIndex]!, sourceIndex });

      if (barrel.length >= minSlots) {
        break;
      }
    }
  }

  return barrel;
};

/** Index in the barrel to land on (last clone of the winner — maximizes spin travel). */
export const getWinnerBarrelIndex = (
  barrel: WheelBarrelSlot[],
  winnerUserId: string,
): number => {
  let lastIndex = -1;

  for (let i = 0; i < barrel.length; i++) {
    if (barrel[i]!.entrant.userId === winnerUserId) {
      lastIndex = i;
    }
  }

  return lastIndex;
};

export const getSpinLoopCountForDuration = (
  barrelLength: number,
  spinDurationSec: number,
): number => {
  if (barrelLength <= 0) {
    return 3;
  }

  const minFullRotations = 3;
  const targetSlots = spinDurationSec * 14;
  const loops = Math.ceil(targetSlots / barrelLength);

  return Math.min(12, Math.max(minFullRotations, loops));
};
