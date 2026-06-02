import type {
  KickChatMessage,
  KickChatMessagePayload,
  KickWebSocketEventMap,
  KickWebSocketEventType,
} from "@/App.types";

type EventHandler<T extends KickWebSocketEventType> = (
  payload: KickWebSocketEventMap[T],
) => void;

export class KickWebSocketManager {
  private ws: WebSocket | null = null;
  private readonly urls: string[];
  private activeUrlIndex = 0;
  private chatroomId: string | null = null;
  private channelId: string | null = null;
  private subscribedChannels: string[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelayMs = 2_000;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
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
    this.chatroomId = chatroomId;
    this.channelId = channelId ?? null;
    this.subscribedChannels = this.buildChannelVariants(chatroomId, this.channelId);
    const socketUrl = new URL(this.getActiveUrl());
    this.ws = new WebSocket(socketUrl.toString());

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.sendSubscribe();
      this.emit("connect", undefined);
    };

    this.ws.onmessage = (event) => {
      if (typeof event.data !== "string") {
        return;
      }

      this.handleIncoming(event.data);
    };

    this.ws.onerror = () => {
      this.emit("error", "WebSocket connection failed.");
    };

    this.ws.onclose = () => {
      this.stopHeartbeat();
      this.emit("disconnect", undefined);
      this.tryReconnect();
    };
  }

  disconnect(): void {
    this.stopHeartbeat();
    this.reconnectAttempts = this.maxReconnectAttempts;
    this.clearReconnectTimeout();
    this.chatroomId = null;
    this.channelId = null;

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private sendSubscribe(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.chatroomId) {
      return;
    }

    this.subscribedChannels.forEach((channel) => {
      const subscribeMessage = {
        event: "pusher:subscribe",
        data: {
          channel,
        },
      };

      this.ws?.send(JSON.stringify(subscribeMessage));
    });
  }

  private handleIncoming(rawData: string): void {
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
      const code = this.readNumericValue(parsedPayload, "code");
      const message = this.readStringValue(parsedPayload ?? {}, "message");

      if (code === 4001 && this.trySwitchToNextUrl()) {
        this.ws?.close();
        return;
      }

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
      const channel = this.extractChannelName(parsedPayload);
      const fallbackChannel = this.subscribedChannels[0] ?? "unknown";

      this.emit("subscription_ready", channel ?? fallbackChannel);
      return;
    }

    if (event === "pusher:ping") {
      this.ws?.send(JSON.stringify({ event: "pusher:pong" }));
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

    if (!message) {
      return;
    }

    this.emit("message", message);
  }

  private buildChannelVariants(
    chatroomId: string,
    channelId: string | null,
  ): string[] {
    const baseName = `chatrooms.${chatroomId}`;
    const channels = [`${baseName}.v2`, `${baseName}.v1`, baseName];

    if (channelId) {
      channels.push(`channel.${channelId}`);
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

  private readUnknownValue(
    value: object,
    key: string,
  ): unknown {
    const dictionary = value as Record<string, unknown>;
    return dictionary[key];
  }

  private readStringValue(
    value: object,
    key: string,
  ): string | null {
    const dictionary = value as Record<string, unknown>;
    const rawValue = dictionary[key];
    return typeof rawValue === "string" ? rawValue : null;
  }

  private readNumericValue(
    value: unknown,
    key: string,
  ): number | null {
    if (!value || typeof value !== "object") {
      return null;
    }

    const dictionary = value as Record<string, unknown>;
    const rawValue = dictionary[key];
    return typeof rawValue === "number" ? rawValue : null;
  }

  private getActiveUrl(): string {
    if (this.urls.length === 0) {
      throw new Error("No WebSocket URLs configured.");
    }

    return this.urls[this.activeUrlIndex] ?? this.urls[0];
  }

  private trySwitchToNextUrl(): boolean {
    if (this.urls.length <= 1) {
      return false;
    }

    if (this.activeUrlIndex >= this.urls.length - 1) {
      return false;
    }

    this.activeUrlIndex += 1;
    return true;
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
    this.heartbeatInterval = setInterval(() => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        return;
      }

      this.ws.send(JSON.stringify({ event: "pusher:ping" }));
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

      this.connect(this.chatroomId, this.channelId);
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
