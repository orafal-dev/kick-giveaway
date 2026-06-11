import type { GiveawaySettings } from "@/giveaway/giveaway.types";
import {
  GIVEAWAY_ACTIVE_SESSIONS_KEY,
  giveawaySessionEventsChannel,
  giveawaySessionKey,
} from "@/server/giveaway/giveawayRedisKeys";
import {
  createInitialSessionState,
  GIVEAWAY_SESSION_TTL_SECONDS,
  touchSessionState,
} from "@/server/giveaway/giveawaySessionLogic";
import type {
  GiveawaySessionPatch,
  GiveawaySessionState,
} from "@/server/giveaway/giveawaySession.types";
import { getRedisCommandClient, getRedisPublisher } from "@/server/redis/redisClient";

const parseSessionState = (raw: string | null): GiveawaySessionState | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as GiveawaySessionState;
    if (!parsed.sessionId || typeof parsed.updatedAt !== "number") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const publishSessionState = async (
  state: GiveawaySessionState,
): Promise<void> => {
  const publisher = await getRedisPublisher();
  await publisher.publish(
    giveawaySessionEventsChannel(state.sessionId),
    JSON.stringify(state),
  );
};

const persistSessionState = async (
  state: GiveawaySessionState,
): Promise<GiveawaySessionState> => {
  const client = await getRedisCommandClient();
  const nextState = touchSessionState(state);

  await client.set(giveawaySessionKey(nextState.sessionId), JSON.stringify(nextState), {
    EX: GIVEAWAY_SESSION_TTL_SECONDS,
  });
  await client.sAdd(GIVEAWAY_ACTIVE_SESSIONS_KEY, nextState.sessionId);

  await publishSessionState(nextState);

  return nextState;
};

export const getSessionState = async (
  sessionId: string,
): Promise<GiveawaySessionState | null> => {
  const client = await getRedisCommandClient();
  const raw = await client.get(giveawaySessionKey(sessionId));
  return parseSessionState(raw);
};

export const ensureSessionState = async (
  sessionId: string,
  partial: {
    channelName?: string;
    settings?: GiveawaySettings;
  } = {},
): Promise<GiveawaySessionState> => {
  const existing = await getSessionState(sessionId);
  if (existing) {
    const channelName = partial.channelName?.trim();
    if (channelName && !existing.channelName.trim()) {
      const updated = await updateSessionState(sessionId, { channelName });
      return updated ?? existing;
    }

    return existing;
  }

  return persistSessionState(
    createInitialSessionState(sessionId, partial),
  );
};

export const updateSessionState = async (
  sessionId: string,
  patch: GiveawaySessionPatch,
): Promise<GiveawaySessionState | null> => {
  const existing = await getSessionState(sessionId);
  if (!existing) {
    return null;
  }

  return persistSessionState({
    ...existing,
    ...patch,
  });
};

export const replaceSessionState = async (
  state: GiveawaySessionState,
): Promise<GiveawaySessionState> => persistSessionState(state);

export const mutateSessionState = async (
  sessionId: string,
  mutator: (state: GiveawaySessionState) => GiveawaySessionState | null,
): Promise<GiveawaySessionState | null> => {
  const existing = await getSessionState(sessionId);
  if (!existing) {
    return null;
  }

  const nextState = mutator(existing);
  if (!nextState) {
    return existing;
  }

  return persistSessionState(nextState);
};

export const deleteSessionState = async (sessionId: string): Promise<void> => {
  const client = await getRedisCommandClient();
  await client.del(giveawaySessionKey(sessionId));
  await client.sRem(GIVEAWAY_ACTIVE_SESSIONS_KEY, sessionId);
};

export const listActiveSessionIds = async (): Promise<string[]> => {
  const client = await getRedisCommandClient();
  return client.sMembers(GIVEAWAY_ACTIVE_SESSIONS_KEY);
};

export const recordSessionHeartbeat = async (
  sessionId: string,
): Promise<GiveawaySessionState | null> => {
  return updateSessionState(sessionId, {
    lastHeartbeatAt: Date.now(),
  });
};

export const resetSessionToDefaults = async (
  sessionId: string,
): Promise<GiveawaySessionState | null> => {
  const existing = await getSessionState(sessionId);
  if (!existing) {
    return null;
  }

  return persistSessionState(
    createInitialSessionState(sessionId, {
      channelName: existing.channelName,
      settings: existing.settings,
    }),
  );
};

export const syncSessionSettings = async (
  sessionId: string,
  settings: GiveawaySettings,
): Promise<GiveawaySessionState | null> =>
  updateSessionState(sessionId, {
    settings,
    countdownSeconds: settings.confirmTimeSeconds,
  });
