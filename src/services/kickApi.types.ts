import type { KickChatroomData } from "@/App.types";
import type { GiveawaySessionPatch } from "@/server/giveaway/giveawaySession.types";

export const toChannelSessionPatch = (
  channelName: string,
  channelInfo: KickChatroomData,
): GiveawaySessionPatch => ({
  channelName,
  chatroomId: channelInfo.chatroomId,
  channelId: channelInfo.channelId,
  channelSubscribersOnly: channelInfo.subscribersOnlyMode,
  errorMessage: "",
});
