export const giveawaySessionKey = (sessionId: string): string =>
  `giveaway:session:${sessionId}`;

export const GIVEAWAY_ACTIVE_SESSIONS_KEY = "giveaway:sessions:active";

export const giveawaySessionEventsChannel = (sessionId: string): string =>
  `giveaway:session:${sessionId}:events`;
