import type { Entrant } from "@/giveaway/giveaway.types";
import type { KickChatMessage } from "@/App.types";
import type {
  EligibilityContext,
  EligibilityResult,
} from "@/services/kickEligibility.types";

export const computeEntrantWeight = (
  isSubscriber: boolean,
  subscriberMultiplier: number,
): number => {
  if (!isSubscriber || subscriberMultiplier <= 1) {
    return 1;
  }

  return Math.max(1, Math.floor(subscriberMultiplier));
};

export const checkMessageEligibility = (
  message: KickChatMessage,
  context: EligibilityContext,
): EligibilityResult => {
  const { settings, channelSubscribersOnly } = context;
  const requiresSubscriber = settings.subscribersOnly || channelSubscribersOnly;

  if (requiresSubscriber && !message.isSubscriber) {
    return {
      eligible: false,
      reason: "Subscribers only",
    };
  }

  if (
    settings.subscriptionDurationMonths > 0 &&
    message.subscribedMonths < settings.subscriptionDurationMonths
  ) {
    return {
      eligible: false,
      reason: `Requires ${settings.subscriptionDurationMonths}+ months subscribed`,
    };
  }

  if (settings.followDurationDays > 0 && message.followedDays < settings.followDurationDays) {
    return {
      eligible: false,
      reason: `Requires ${settings.followDurationDays}+ days followed`,
    };
  }

  return { eligible: true };
};

export const buildEntrantFromMessage = (
  message: KickChatMessage,
  settings: EligibilityContext["settings"],
): Entrant => {
  const weight = computeEntrantWeight(message.isSubscriber, settings.subscriberMultiplier);

  return {
    username: message.username,
    userId: message.userId,
    isSubscriber: message.isSubscriber,
    isFollower: message.isFollower,
    subscribedMonths: message.subscribedMonths,
    followedDays: message.followedDays,
    weight,
  };
};

export const mergeEntrantMetadata = (
  existing: Entrant,
  incoming: Entrant,
  subscriberMultiplier: number,
): Entrant => ({
  ...existing,
  isSubscriber: existing.isSubscriber || incoming.isSubscriber,
  isFollower: existing.isFollower || incoming.isFollower,
  subscribedMonths: Math.max(existing.subscribedMonths, incoming.subscribedMonths),
  followedDays: Math.max(existing.followedDays, incoming.followedDays),
  weight: computeEntrantWeight(
    existing.isSubscriber || incoming.isSubscriber,
    subscriberMultiplier,
  ),
});
