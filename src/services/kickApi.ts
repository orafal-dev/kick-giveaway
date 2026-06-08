import type { KickChannelResponse, KickChatroomData } from "@/App.types";

/** Resolve channel metadata from the browser. Kick blocks server-side fetches (403). */
export const fetchKickChannelInfo = async (
  channelName: string,
): Promise<KickChatroomData> => {
  const normalizedChannelName = channelName.trim().toLowerCase();

  if (!normalizedChannelName) {
    throw new Error("Channel name is required.");
  }

  const response = await fetch(
    `https://kick.com/api/v1/channels/${normalizedChannelName}`,
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Channel "${normalizedChannelName}" not found.`);
    }

    throw new Error(`Kick API error: ${response.status}.`);
  }

  const data: KickChannelResponse = await response.json();

  if (!data.chatroom?.id) {
    throw new Error("Kick channel did not return a chatroom id.");
  }

  const chatMode = data.chatroom.chat_mode ?? null;
  const followersOnlyMode =
    data.chatroom.followers_mode === true ||
    chatMode === "followers" ||
    chatMode === "followers_only";
  const subscribersOnlyMode =
    data.chatroom.subscribers_mode === true ||
    chatMode === "subscribers" ||
    chatMode === "subscribers_only";

  return {
    chatroomId: String(data.chatroom.id),
    channelId:
      data.chatroom.channel_id !== null && data.chatroom.channel_id !== undefined
        ? String(data.chatroom.channel_id)
        : null,
    channelName: data.slug ?? normalizedChannelName,
    chatMode,
    followersOnlyMode,
    subscribersOnlyMode,
  };
};
