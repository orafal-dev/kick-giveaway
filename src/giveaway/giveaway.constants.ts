import type { GiveawaySettings } from "@/giveaway/giveaway.types";

export const STORAGE_KEY = "kick-giveaway-state-v2";
export const THEME_STORAGE_KEY = "kick-giveaway-theme";

export const DEFAULT_SETTINGS: GiveawaySettings = {
  keyword: "!giveaway",
  winnersCount: 1,
  subscriptionDurationMonths: 0,
  subscriberMultiplier: 1,
  followDurationDays: 0,
  subscribersOnly: false,
  winnerConfirmationEnabled: true,
  confirmTimeSeconds: 60,
  animationMode: "scramble",
};

export const ROLL_ANIMATION_MS = 2200;
export const ROLL_ANIMATION_INTERVAL_MS = 80;
export const CLASSIC_ANIMATION_INTERVAL_MS = 120;
/** Total time for wheel-picker spin (fast start → slow stop). */
export const WHEEL_SPIN_DURATION_MS = 5_200;
/** Fallback hide delay; spawn tween is 5s, then pieces need time to fall. */
export const CONFETTI_DURATION_MS = 15_000;
export const RECENT_MESSAGES_RETENTION_MS = 60_000;
export const RECENT_MESSAGES_LIMIT = 10;

export const MIN_WINNERS_COUNT = 1;
export const MAX_WINNERS_COUNT = 50;
export const MIN_MULTIPLIER = 1;
export const MAX_MULTIPLIER = 10;
export const MIN_CONFIRM_SECONDS = 5;
export const MAX_CONFIRM_SECONDS = 600;

/** Stable reference for Base UI Select — must not be recreated per render. */
export const ANIMATION_SELECT_ITEMS = [
  { label: "Wheel picker", value: "wheel" },
  { label: "Classic", value: "classic" },
  { label: "Scramble", value: "scramble" },
] as const;
