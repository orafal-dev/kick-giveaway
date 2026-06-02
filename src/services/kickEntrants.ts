import type { Entrant, GiveawaySettings, WinnerRecord } from "@/giveaway/giveaway.types";
import type { KickChatMessage } from "@/App.types";
import { normalizeValue } from "@/services/drawUtils";
import {
  buildEntrantFromMessage,
  checkMessageEligibility,
  mergeEntrantMetadata,
} from "@/services/kickEligibility";
import type { EligibilityContext } from "@/services/kickEligibility.types";

export const matchesKeyword = (message: string, keyword: string): boolean => {
  const normalizedKeyword = normalizeValue(keyword);
  const normalizedMessage = normalizeValue(message);

  if (!normalizedKeyword) {
    return true;
  }

  return normalizedMessage === normalizedKeyword;
};

export const getEligibleDrawPool = (
  entrants: Entrant[],
  winners: WinnerRecord[],
): Entrant[] => {
  const winnerUsernames = new Set(
    winners.map((winner) => normalizeValue(winner.username)),
  );

  return entrants.filter(
    (entrant) => !winnerUsernames.has(normalizeValue(entrant.username)),
  );
};

export const tryAddEntrant = (
  entrants: Entrant[],
  chatMessage: KickChatMessage,
  settings: GiveawaySettings,
  channelSubscribersOnly: boolean,
): Entrant[] => {
  if (!matchesKeyword(chatMessage.message, settings.keyword)) {
    return entrants;
  }

  const context: EligibilityContext = { settings, channelSubscribersOnly };
  const eligibility = checkMessageEligibility(chatMessage, context);

  if (!eligibility.eligible) {
    return entrants;
  }

  const incoming = buildEntrantFromMessage(chatMessage, settings);
  const existingIndex = entrants.findIndex(
    (entrant) =>
      entrant.userId === incoming.userId ||
      normalizeValue(entrant.username) === normalizeValue(incoming.username),
  );

  if (existingIndex === -1) {
    return [...entrants, incoming];
  }

  const updated = [...entrants];
  updated[existingIndex] = mergeEntrantMetadata(
    entrants[existingIndex],
    incoming,
    settings.subscriberMultiplier,
  );
  return updated;
};
