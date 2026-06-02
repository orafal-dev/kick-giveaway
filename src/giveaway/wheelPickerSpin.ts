import { getSecureRandomIndex } from "@/services/drawUtils";

/** Full wheel rotations before landing on the winner (3–5). */
export const getSpinLoopCount = (): number => 3 + getSecureRandomIndex(3);

export const getWinnerIndex = (
  entrants: { userId: string }[],
  winnerUserId: string,
): number =>
  entrants.findIndex((entrant) => entrant.userId === winnerUserId);
