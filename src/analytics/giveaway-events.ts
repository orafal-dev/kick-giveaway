import type { GiveawaySettings } from "@/giveaway/giveaway.types";

import type { GiveawayStartedEventProperties } from "./giveaway-events.types";

export const buildGiveawayStartedProperties = (
  channel: string,
  settings: GiveawaySettings,
): GiveawayStartedEventProperties => ({
  channel,
  winners_count: settings.winnersCount,
  animation_mode: settings.animationMode,
  subscribers_only: settings.subscribersOnly,
  winner_confirmation_enabled: settings.winnerConfirmationEnabled,
});
