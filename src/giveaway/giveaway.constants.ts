import type { GiveawaySettings } from "@/giveaway/giveaway.types";

export const STORAGE_KEY = "kick-giveaway-state-v2";

export const DEFAULT_SETTINGS: GiveawaySettings = {
  keyword: "!giveaway",
  winnersCount: 1,
  subscriptionDurationMonths: 0,
  subscriberMultiplier: 1,
  followDurationDays: 0,
  subscribersOnly: false,
  winnerConfirmationEnabled: true,
  confirmTimeSeconds: 60,
  animationMode: "wheel",
  animationDurationSeconds: 8,
  ignoredNicks: [],
};

export const MAX_IGNORED_NICKS = 50;

export const ROLL_ANIMATION_MS = 2200;
export const ROLL_ANIMATION_INTERVAL_MS = 80;
export const CLASSIC_ANIMATION_INTERVAL_MS = 120;
/** Minimum visual slots on the wheel when there are fewer real participants. */
export const MIN_WHEEL_BARREL_SLOTS = 50;
/** Brief pause on the winner after the wheel stops (not scaled with the duration slider). */
export const WHEEL_POST_SPIN_HOLD_MS = 800;
/** Fallback hide delay; spawn tween is 5s, then pieces need time to fall. */
export const CONFETTI_DURATION_MS = 15_000;
export const RECENT_MESSAGES_RETENTION_MS = 60_000;
export const RECENT_MESSAGES_LIMIT = 10;
/** Max chat lines kept per winner after they are drawn. */
export const WINNER_CONFIRMATION_MESSAGES_LIMIT = 10;

export const MIN_WINNERS_COUNT = 1;
export const MAX_WINNERS_COUNT = 50;
export const MIN_MULTIPLIER = 1;
export const MAX_MULTIPLIER = 10;
export const MIN_CONFIRM_SECONDS = 5;
export const MAX_CONFIRM_SECONDS = 600;
export const MIN_ANIMATION_DURATION_SECONDS = 3;
export const MAX_ANIMATION_DURATION_SECONDS = 15;

/** Stable reference for Base UI Select — must not be recreated per render. */
export const ANIMATION_SELECT_ITEMS = [
  { label: "Wheel picker", value: "wheel" },
  { label: "Classic", value: "classic" },
  { label: "Scramble", value: "scramble" },
] as const;
