import type { PendingWinner, WinnerRecord } from "@/giveaway/giveaway.types";
import { normalizeValue } from "@/services/drawUtils";

export const findWinnerByUsername = (
  winners: WinnerRecord[],
  username: string,
): WinnerRecord | undefined =>
  winners.find(
    (winner) => normalizeValue(winner.username) === normalizeValue(username),
  );

/** True when the current on-screen name is an outstanding no-show (not pending re-confirmation). */
export const isCurrentSelectionNoShow = (
  displayName: string,
  winners: WinnerRecord[],
  pendingWinner: PendingWinner | null,
): boolean => {
  if (!displayName.trim() || pendingWinner) {
    return false;
  }

  return findWinnerByUsername(winners, displayName)?.noShow === true;
};

export const upgradeNoShowWinner = (
  winners: WinnerRecord[],
  username: string,
  userId: string,
  confirmedAt: number | null,
  confirmationMessages: WinnerRecord["confirmationMessages"],
): WinnerRecord[] | null => {
  const existingIndex = winners.findIndex(
    (winner) => normalizeValue(winner.username) === normalizeValue(username),
  );

  if (existingIndex === -1) {
    return null;
  }

  const existing = winners[existingIndex]!;

  if (!existing.noShow) {
    return winners;
  }

  const nextWinners = [...winners];
  nextWinners[existingIndex] = {
    ...existing,
    userId,
    confirmedAt,
    noShow: false,
    confirmationMessages: [...confirmationMessages],
  };

  return nextWinners;
};
