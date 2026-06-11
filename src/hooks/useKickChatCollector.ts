import { useEffect, useRef } from "react";
import type { KickChatMessage } from "@/App.types";
import { KICK_WS_URLS } from "@/constants";
import type { ConnectionStatus } from "@/giveaway/giveaway.types";
import { runGiveawaySessionAction } from "@/services/giveawaySessionApi";
import { KickWebSocketManager } from "@/services/kickWebSocket";
import type { UseKickChatCollectorOptions } from "@/hooks/useKickChatCollector.types";

const COUNTDOWN_TICK_INTERVAL_MS = 1_000;

const shouldMaintainWebSocket = (options: {
  channelName: string;
  chatroomId: string | null;
  connectionStatus: ConnectionStatus;
  giveawayStarted: boolean;
}): boolean => {
  return (
    Boolean(options.channelName.trim()) &&
    Boolean(options.chatroomId) &&
    (options.connectionStatus === "connecting" ||
      options.connectionStatus === "connected" ||
      options.giveawayStarted)
  );
};

export const useKickChatCollector = ({
  sessionId,
  chatroomId,
  channelId,
  channelName,
  connectionStatus,
  giveawayStarted,
  isCountdownActive,
  isServerReady,
  serverUnavailable,
  applyServerState,
}: UseKickChatCollectorOptions): void => {
  const managerRef = useRef<KickWebSocketManager | null>(null);
  const isConnectingRef = useRef(false);
  const messageQueueRef = useRef<KickChatMessage[]>([]);
  const isProcessingMessagesRef = useRef(false);
  const connectionStatusRef = useRef(connectionStatus);
  const giveawayStartedRef = useRef(giveawayStarted);
  const chatroomIdRef = useRef(chatroomId);
  const channelIdRef = useRef(channelId);

  useEffect(() => {
    connectionStatusRef.current = connectionStatus;
  }, [connectionStatus]);

  useEffect(() => {
    giveawayStartedRef.current = giveawayStarted;
  }, [giveawayStarted]);

  useEffect(() => {
    chatroomIdRef.current = chatroomId;
  }, [chatroomId]);

  useEffect(() => {
    channelIdRef.current = channelId;
  }, [channelId]);

  const runSessionAction = async (
    action: Parameters<typeof runGiveawaySessionAction>[1],
    payload: Record<string, unknown> = {},
  ): Promise<void> => {
    if (!sessionId || serverUnavailable) {
      return;
    }

    try {
      const { state } = await runGiveawaySessionAction(sessionId, action, payload);
      applyServerState(state);
    } catch {
      // SSE or a later retry will reconcile state.
    }
  };

  const processMessageQueue = async (): Promise<void> => {
    if (isProcessingMessagesRef.current || !sessionId || serverUnavailable) {
      return;
    }

    isProcessingMessagesRef.current = true;

    while (messageQueueRef.current.length > 0) {
      const message = messageQueueRef.current.shift();
      if (!message) {
        continue;
      }

      await runSessionAction("chat-message", { message });
    }

    isProcessingMessagesRef.current = false;
  };

  const enqueueChatMessage = (message: KickChatMessage): void => {
    messageQueueRef.current.push(message);
    void processMessageQueue();
  };

  const teardownManager = (): void => {
    managerRef.current?.disconnect();
    managerRef.current = null;
    isConnectingRef.current = false;
  };

  const connectManager = (): void => {
    const activeChatroomId = chatroomIdRef.current;
    if (
      !sessionId ||
      serverUnavailable ||
      !activeChatroomId ||
      isConnectingRef.current ||
      managerRef.current
    ) {
      return;
    }

    isConnectingRef.current = true;

    try {
      const manager = new KickWebSocketManager([...KICK_WS_URLS]);
      managerRef.current = manager;

      manager.on("subscription_ready", () => {
        void runSessionAction("ws-ready");
      });

      manager.on("message", (chatMessage) => {
        enqueueChatMessage(chatMessage);
      });

      manager.on("disconnect", () => {
        teardownManager();

        if (giveawayStartedRef.current && chatroomIdRef.current) {
          void runSessionAction("ws-disconnected");
          return;
        }

        void runSessionAction("ws-disconnected");
      });

      manager.on("error", (message) => {
        teardownManager();
        void runSessionAction("ws-error", { message });
      });

      manager.connect(activeChatroomId, channelIdRef.current);
    } catch (error) {
      teardownManager();
      void runSessionAction("ws-error", {
        message:
          error instanceof Error
            ? error.message
            : "Failed to connect to channel.",
      });
    } finally {
      isConnectingRef.current = false;
    }
  };

  useEffect(() => {
    if (!sessionId || !isServerReady || serverUnavailable) {
      teardownManager();
      return;
    }

    const maintainConnection = shouldMaintainWebSocket({
      channelName,
      chatroomId,
      connectionStatus,
      giveawayStarted,
    });

    if (!maintainConnection) {
      teardownManager();
      return;
    }

    if (!managerRef.current && !isConnectingRef.current) {
      connectManager();
    }
  }, [
    channelName,
    chatroomId,
    channelId,
    connectionStatus,
    giveawayStarted,
    isServerReady,
    serverUnavailable,
    sessionId,
  ]);

  useEffect(() => {
    return () => {
      teardownManager();
    };
  }, [sessionId]);

  useEffect(() => {
    if (
      !sessionId ||
      !isServerReady ||
      serverUnavailable ||
      !isCountdownActive
    ) {
      return;
    }

    const intervalId = setInterval(() => {
      void runSessionAction("tick-countdown");
    }, COUNTDOWN_TICK_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [isCountdownActive, isServerReady, serverUnavailable, sessionId]);
};
