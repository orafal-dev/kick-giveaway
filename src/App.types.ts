export interface KickChannelResponse {
  id: number;
  slug: string;
  chatroom?: {
    id: number;
    channel_id?: number | null;
    chat_mode?: string | null;
    followers_mode?: boolean | null;
    subscribers_mode?: boolean | null;
  };
}

export interface KickChatroomData {
  chatroomId: string;
  channelId: string | null;
  channelName: string;
  chatMode: string | null;
  followersOnlyMode: boolean;
  subscribersOnlyMode: boolean;
}

export interface KickChatBadge {
  type?: string;
  text?: string;
}

export interface KickChatBadgeV2 {
  name?: string;
  badge_type?: string;
  image_url?: string;
  metadata?: Record<string, unknown>;
  selected?: boolean;
  sort_order?: number;
}

export interface KickChatSender {
  id?: number | string;
  username?: string;
  slug?: string;
  is_subscriber?: boolean;
  isSubscriber?: boolean;
  is_follower?: boolean;
  isFollower?: boolean;
  subscribed_for?: number;
  subscribedFor?: number;
  followed_for?: number;
  followedFor?: number;
  identity?: {
    color?: string;
    badges?: KickChatBadge[];
    badges_v2?: KickChatBadgeV2[];
  };
}

/** Inner payload after parsing the `data` string on ChatMessageEvent frames. */
export interface KickChatMessagePayload {
  id?: string;
  chatroom_id?: number;
  content?: string;
  type?: string;
  created_at?: string;
  sender?: KickChatSender;
  metadata?: Record<string, unknown>;
  message?: KickChatMessagePayload;
}

/** Top-level Pusher frame for Kick chat (event + stringified data + channel). */
export interface KickChatWebSocketFrame {
  event: string;
  data: string;
  channel: string;
}

export interface KickChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
  isSubscriber: boolean;
  isFollower: boolean;
  subscribedMonths: number;
  followedDays: number;
}

export interface KickRawWebSocketEvent {
  event: string;
  channel: string | null;
  payloadPreview: string;
  timestamp: number;
}

export type KickWebSocketEventType =
  | "connect"
  | "disconnect"
  | "error"
  | "message"
  | "subscription_ready"
  | "raw_event";

export interface KickWebSocketEventMap {
  connect: undefined;
  disconnect: undefined;
  error: string;
  message: KickChatMessage;
  subscription_ready: string;
  raw_event: KickRawWebSocketEvent;
}
