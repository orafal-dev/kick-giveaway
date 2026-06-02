/** Kick chat Pusher app key (same across all cluster hosts). */
export const KICK_PUSHER_APP_KEY = "dd11c46dae0376080879";

const KICK_PUSHER_QUERY =
  "protocol=7&client=js&version=8.5.0&flash=false" as const;

const kickPusherUrl = (host: string) =>
  `wss://${host}/app/${KICK_PUSHER_APP_KEY}?${KICK_PUSHER_QUERY}`;

/** Regional fallbacks share the same app key; only the host changes. */
export const KICK_WS_URLS = [
  kickPusherUrl("ws-us3.pusher.com"),
  kickPusherUrl("ws-mt1.pusher.com"),
  kickPusherUrl("ws-us2.pusher.com"),
  kickPusherUrl("ws.pusherapp.com"),
];

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
  WHEEL_SPIN_DURATION_MS,
} from "@/giveaway/giveaway.constants";
