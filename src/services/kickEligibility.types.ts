import type { GiveawaySettings } from "@/giveaway/giveaway.types";
import type { KickChatMessage } from "@/App.types";

export interface EligibilityContext {
  settings: GiveawaySettings;
  channelSubscribersOnly: boolean;
}

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
}

export type { KickChatMessage };
