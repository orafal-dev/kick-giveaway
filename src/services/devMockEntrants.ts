import type { KickChatMessage } from "@/App.types";
import type { Entrant, GiveawaySettings } from "@/giveaway/giveaway.types";
import { tryAddEntrant } from "@/services/kickEntrants";

const randomIntInclusive = (min: number, max: number, seed: number): number => {
  const range = max - min + 1;
  return min + (Math.abs(seed) % range);
};

const buildMockProfile = (
  index: number,
): Pick<
  KickChatMessage,
  "isSubscriber" | "isFollower" | "subscribedMonths" | "followedDays"
> => {
  const bucket = index % 10;

  if (bucket < 2) {
    return {
      isSubscriber: true,
      isFollower: true,
      subscribedMonths: randomIntInclusive(1, 24, index * 7 + 3),
      followedDays: randomIntInclusive(30, 365, index * 11 + 5),
    };
  }

  if (bucket < 7) {
    return {
      isSubscriber: false,
      isFollower: true,
      subscribedMonths: 0,
      followedDays: randomIntInclusive(7, 365, index * 13 + 1),
    };
  }

  return {
    isSubscriber: false,
    isFollower: false,
    subscribedMonths: 0,
    followedDays: 0,
  };
};

export const createMockKickMessages = (
  count: number,
  keyword: string,
): KickChatMessage[] => {
  const messages: KickChatMessage[] = [];
  const baseTimestamp = Date.now();

  for (let index = 0; index < count; index += 1) {
    const ordinal = String(index + 1).padStart(3, "0");
    const username = `dev_user_${ordinal}`;
    const profile = buildMockProfile(index);

    messages.push({
      id: `dev-mock-${ordinal}`,
      userId: `dev-${ordinal}`,
      username,
      message: keyword,
      timestamp: baseTimestamp - index,
      ...profile,
    });
  }

  return messages;
};

export const seedEntrantsFromMockMessages = (
  entrants: Entrant[],
  messages: KickChatMessage[],
  settings: GiveawaySettings,
  channelSubscribersOnly: boolean,
): Entrant[] =>
  messages.reduce(
    (accumulated, message) =>
      tryAddEntrant(accumulated, message, settings, channelSubscribersOnly),
    entrants,
  );
