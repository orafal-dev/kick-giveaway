import type {
  KickChatMessage,
  KickChatMessagePayload,
  KickWebSocketEventMap,
  KickWebSocketEventType,
} from "@/App.types";

type EventHandler<T extends KickWebSocketEventType> = (
  payload: KickWebSocketEventMap[T],
) => void;

const MAX_DEDUPED_MESSAGE_IDS = 1_000;

export class KickWebSocketManager {
  private readonly sockets = new Map<number, WebSocket>();
  private readonly urls: string[];
  private chatroomId: string | null = null;
  private channelId: string | null = null;
  private subscribedChannels: string[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelayMs = 2_000;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private hasEmittedConnect = false;
  private hasEmittedSubscriptionReady = false;
  private isDisconnecting = false;
  private readonly recentMessageIds = new Set<string>();
  private eventHandlers: Record<
    KickWebSocketEventType,
    Set<(payload: unknown) => void>
  > = {
    connect: new Set(),
    disconnect: new Set(),
    error: new Set(),
    message: new Set(),
    subscription_ready: new Set(),
    raw_event: new Set(),
  };

  constructor(urls: string[]) {
    this.urls = urls;
  }

  on<T extends KickWebSocketEventType>(
    event: T,
    handler: EventHandler<T>,
  ): () => void {
    this.eventHandlers[event].add(handler as (payload: unknown) => void);

    return () => {
      this.eventHandlers[event].delete(handler as (payload: unknown) => void);
    };
  }

  private emit<T extends KickWebSocketEventType>(
    event: T,
    payload: KickWebSocketEventMap[T],
  ): void {
    this.eventHandlers[event].forEach((handler) => {
      handler(payload);
    });
  }

  connect(chatroomId: string, channelId?: string | null): void {
    this.isDisconnecting = false;
    this.chatroomId = chatroomId;
    this.channelId = channelId ?? null;
    this.subscribedChannels = this.buildChannelVariants(chatroomId, this.channelId);
    this.hasEmittedConnect = false;
    this.hasEmittedSubscriptionReady = false;
    this.reconnectAttempts = 0;
    this.recentMessageIds.clear();

    this.urls.forEach((url, index) => {
      this.openSocket(index, url);
    });
  }

  disconnect(): void {
    this.isDisconnecting = true;
    this.stopHeartbeat();
    this.reconnectAttempts = this.maxReconnectAttempts;
    this.clearReconnectTimeout();
    this.chatroomId = null;
    this.channelId = null;
    this.hasEmittedConnect = false;
    this.hasEmittedSubscriptionReady = false;
    this.recentMessageIds.clear();

    this.sockets.forEach((socket) => {
      socket.close();
    });
    this.sockets.clear();
  }

  private openSocket(index: number, url: string): void {
    const existing = this.sockets.get(index);
    if (existing) {
      existing.close();
      this.sockets.delete(index);
    }

    const ws = new WebSocket(url);
    this.sockets.set(index, ws);

    ws.onopen = () => {
      this.sendSubscribe(ws);

      if (!this.hasEmittedConnect) {
        this.hasEmittedConnect = true;
        this.startHeartbeat();
        this.emit("connect", undefined);
      }
    };

    ws.onmessage = (event) => {
      if (typeof event.data !== "string") {
        return;
      }

      this.handleIncoming(ws, event.data);
    };

    ws.onerror = () => {
      if (!this.hasEmittedConnect) {
        this.emit("error", "WebSocket connection failed.");
      }
    };

    ws.onclose = () => {
      this.sockets.delete(index);

      if (this.sockets.size === 0) {
        this.stopHeartbeat();
        this.hasEmittedConnect = false;
        this.hasEmittedSubscriptionReady = false;
        this.emit("disconnect", undefined);

        if (!this.isDisconnecting) {
          this.tryReconnect();
        }
      }
    };
  }

  private sendSubscribe(ws: WebSocket): void {
    if (ws.readyState !== WebSocket.OPEN) {
      return;
    }

    this.subscribedChannels.forEach((channel) => {
      ws.send(
        JSON.stringify({
          event: "pusher:subscribe",
          data: {
            auth: "",
            channel,
          },
        }),
      );
    });
  }

  private handleIncoming(ws: WebSocket, rawData: string): void {
    const parsed = this.tryParseJson(rawData);

    if (!parsed || typeof parsed !== "object") {
      return;
    }

    const event = this.readStringValue(parsed, "event");

    if (!event) {
      return;
    }

    const channel = this.readStringValue(parsed, "channel");
    this.emit("raw_event", {
      event,
      channel,
      payloadPreview: rawData.slice(0, 350),
      timestamp: Date.now(),
    });

    if (event === "pusher:error") {
      const payload = this.readUnknownValue(parsed, "data");
      const parsedPayload =
        typeof payload === "string" ? this.tryParseJson(payload) : payload;
      const message = this.readStringValue(parsedPayload ?? {}, "message");

      if (message) {
        this.emit("error", message);
      }
      return;
    }

    if (
      event === "pusher:subscription_succeeded" ||
      event === "pusher_internal:subscription_succeeded"
    ) {
      const payload = this.readUnknownValue(parsed, "data");
      const parsedPayload =
        typeof payload === "string" ? this.tryParseJson(payload) : payload;
      const subscriptionChannel = this.extractChannelName(parsedPayload);
      const fallbackChannel = this.subscribedChannels[0] ?? "unknown";

      if (!this.hasEmittedSubscriptionReady) {
        this.hasEmittedSubscriptionReady = true;
        this.emit("subscription_ready", subscriptionChannel ?? fallbackChannel);
      }
      return;
    }

    if (event === "pusher:ping") {
      ws.send(JSON.stringify({ event: "pusher:pong" }));
      return;
    }

    const payload = this.readUnknownValue(parsed, "data");
    const parsedPayload =
      typeof payload === "string" ? this.tryParseJson(payload) : payload;

    if (!parsedPayload || typeof parsedPayload !== "object") {
      return;
    }

    const message = this.extractChatMessage(
      event,
      parsedPayload as KickChatMessagePayload,
    );

    if (!message || !this.shouldEmitMessage(message)) {
      return;
    }

    this.emit("message", message);
  }

  private shouldEmitMessage(message: KickChatMessage): boolean {
    if (this.recentMessageIds.has(message.id)) {
      return false;
    }

    this.recentMessageIds.add(message.id);

    if (this.recentMessageIds.size > MAX_DEDUPED_MESSAGE_IDS) {
      const oldestId = this.recentMessageIds.values().next().value;
      if (oldestId) {
        this.recentMessageIds.delete(oldestId);
      }
    }

    return true;
  }

  private buildChannelVariants(
    chatroomId: string,
    channelId: string | null,
  ): string[] {
    const channels = [
      `chatroom_${chatroomId}`,
      `chatrooms.${chatroomId}.v2`,
      `chatrooms.${chatroomId}`,
    ];

    if (channelId) {
      channels.splice(1, 0, `channel_${channelId}`, `channel.${channelId}`);
    }

    return channels;
  }

  private extractChannelName(payload: unknown): string | null {
    if (!payload || typeof payload !== "object") {
      return null;
    }

    return this.readStringValue(payload, "channel");
  }

  private extractChatMessage(
    event: string,
    payload: KickChatMessagePayload,
  ): KickChatMessage | null {
    const directMessage = this.toKickChatMessage(payload);
    if (directMessage) {
      return directMessage;
    }

    const nestedPayload = this.readUnknownValue(payload as object, "message");
    if (nestedPayload && typeof nestedPayload === "object") {
      const nestedMessage = this.toKickChatMessage(
        nestedPayload as KickChatMessagePayload,
      );
      if (nestedMessage) {
        return nestedMessage;
      }
    }

    if (event !== "App\\Events\\ChatMessageEvent") {
      return null;
    }

    return null;
  }

  private tryParseJson(value: string): unknown {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  private readUnknownValue(value: object, key: string): unknown {
    const dictionary = value as Record<string, unknown>;
    return dictionary[key];
  }

  private readStringValue(value: object, key: string): string | null {
    const dictionary = value as Record<string, unknown>;
    const rawValue = dictionary[key];
    return typeof rawValue === "string" ? rawValue : null;
  }

  private toKickChatMessage(payload: KickChatMessagePayload): KickChatMessage | null {
    const sender = payload.sender;
    const username = sender?.username?.trim() ?? sender?.slug?.trim();
    const message = payload.content?.trim();

    if (!username || !message) {
      return null;
    }

    const userId = sender?.id !== undefined ? String(sender.id) : username;
    const badges = sender?.identity?.badges ?? [];
    const badgesV2 = sender?.identity?.badges_v2 ?? [];
    const hasSubscriberBadge =
      badges.some((badge) => {
        const badgeType = (badge.type ?? badge.text ?? "").toLowerCase();
        return badgeType.includes("subscriber") || badgeType.includes("sub");
      }) ||
      badgesV2.some((badge) => {
        const badgeType = (badge.badge_type ?? badge.name ?? "").toLowerCase();
        return badgeType.includes("subscriber") || badgeType.includes("sub");
      });

    const isSubscriber =
      sender?.is_subscriber === true ||
      sender?.isSubscriber === true ||
      hasSubscriberBadge;
    const isFollower =
      sender?.is_follower === true || sender?.isFollower === true || isSubscriber;

    const subscribedMonths = this.parseDurationMonths(
      sender?.subscribed_for ?? sender?.subscribedFor,
    );
    const followedDays = this.parseDurationDays(
      sender?.followed_for ?? sender?.followedFor,
    );

    return {
      id: payload.id ?? `${username}-${Date.now()}`,
      userId,
      username,
      message,
      timestamp: payload.created_at ? Date.parse(payload.created_at) : Date.now(),
      isSubscriber,
      isFollower,
      subscribedMonths,
      followedDays,
    };
  }

  private parseDurationMonths(value: number | undefined): number {
    if (typeof value !== "number" || value <= 0) {
      return 0;
    }

    if (value > 365) {
      return Math.floor(value / (30 * 24 * 60 * 60));
    }

    if (value > 48) {
      return Math.floor(value / (30 * 24 * 60));
    }

    return Math.max(0, Math.floor(value));
  }

  private parseDurationDays(value: number | undefined): number {
    if (typeof value !== "number" || value <= 0) {
      return 0;
    }

    if (value > 365) {
      return Math.floor(value / (24 * 60 * 60));
    }

    if (value > 48) {
      return Math.floor(value / (24 * 60));
    }

    return Math.max(0, Math.floor(value));
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      return;
    }

    this.heartbeatInterval = setInterval(() => {
      this.sockets.forEach((socket) => {
        if (socket.readyState !== WebSocket.OPEN) {
          return;
        }

        socket.send(JSON.stringify({ event: "pusher:ping" }));
      });
    }, 25_000);
  }

  private stopHeartbeat(): void {
    if (!this.heartbeatInterval) {
      return;
    }

    clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = null;
  }

  private tryReconnect(): void {
    if (!this.chatroomId || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts += 1;
    const nextDelay = this.reconnectDelayMs * 2 ** (this.reconnectAttempts - 1);

    this.clearReconnectTimeout();
    this.reconnectTimeout = setTimeout(() => {
      if (!this.chatroomId) {
        return;
      }

      this.urls.forEach((url, index) => {
        this.openSocket(index, url);
      });
    }, nextDelay);
  }

  private clearReconnectTimeout(): void {
    if (!this.reconnectTimeout) {
      return;
    }

    clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = null;
  }
}
