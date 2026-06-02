/** Kick chat Pusher endpoints (one per regional cluster, each with its own app key). */
export const KICK_WS_URLS = [
  "wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.5.0&flash=false",
  "wss://ws-mt1.pusher.com/app/73aa60a071d0943a6b3e?protocol=7&client=js&version=8.5.0&flash=false",
  "wss://ws-us3.pusher.com/app/dd11c46dae0376080879?protocol=7&client=js&version=8.5.0&flash=false",
] as const;

export {
  CLASSIC_ANIMATION_INTERVAL_MS,
  CONFETTI_DURATION_MS,
  DEFAULT_SETTINGS,
  MAX_CONFIRM_SECONDS,
  MAX_MULTIPLIER,
  MAX_WINNERS_COUNT,
  MIN_CONFIRM_SECONDS,
  MIN_MULTIPLIER,
  MIN_WINNERS_COUNT,
  RECENT_MESSAGES_LIMIT,
  RECENT_MESSAGES_RETENTION_MS,
  ROLL_ANIMATION_INTERVAL_MS,
  ROLL_ANIMATION_MS,
  WHEEL_POST_SPIN_HOLD_MS,
} from "@/giveaway/giveaway.constants";
