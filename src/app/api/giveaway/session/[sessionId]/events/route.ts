import { giveawaySessionEventsChannel } from "@/server/giveaway/giveawayRedisKeys";
import { getSessionState } from "@/server/giveaway/giveawaySessionStore";
import { requireRedis } from "@/server/giveaway/giveawayApiHandlers";
import {
  createDedicatedSubscriber,
  getRedisCommandClient,
} from "@/server/redis/redisClient";

interface EventsRouteContext {
  params: Promise<{ sessionId: string }>;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = async (
  _request: Request,
  context: EventsRouteContext,
): Promise<Response> => {
  const redisError = requireRedis();
  if (redisError) {
    return redisError;
  }

  const { sessionId } = await context.params;
  const normalizedSessionId = sessionId.trim();

  if (!normalizedSessionId) {
    return Response.json({ error: "Missing session id." }, { status: 400 });
  }

  const initialState = await getSessionState(normalizedSessionId);
  if (!initialState) {
    return Response.json({ error: "Session not found." }, { status: 404 });
  }

  const commandClient = await getRedisCommandClient();
  const channel = giveawaySessionEventsChannel(normalizedSessionId);
  const subscriber = await createDedicatedSubscriber();

  let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  let isClosed = false;

  const stream = new ReadableStream<Uint8Array>({
    start: async (controller) => {
      const encoder = new TextEncoder();

      const sendEvent = (state: unknown): void => {
        if (isClosed) {
          return;
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(state)}\n\n`),
        );
      };

      sendEvent(initialState);

      const messageHandler = (message: string): void => {
        try {
          sendEvent(JSON.parse(message));
        } catch {
          // Ignore malformed payloads.
        }
      };

      await subscriber.subscribe(channel, messageHandler);

      heartbeatInterval = setInterval(() => {
        if (isClosed) {
          return;
        }

        controller.enqueue(encoder.encode(": heartbeat\n\n"));
      }, 15_000);

      const refreshTtl = async (): Promise<void> => {
        await commandClient.expire(
          `giveaway:session:${normalizedSessionId}`,
          2 * 60 * 60,
        );
      };

      void refreshTtl();
    },
    cancel: async () => {
      isClosed = true;

      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }

      try {
        await subscriber.unsubscribe(channel);
        if (subscriber.isOpen) {
          await subscriber.quit();
        }
      } catch {
        // Ignore unsubscribe errors during shutdown.
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
};
