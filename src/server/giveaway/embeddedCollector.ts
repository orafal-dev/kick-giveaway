import { GiveawayCollector } from "@/collector/GiveawayCollector";
import { isRedisConfigured } from "@/server/redis/redisConfig";

let embeddedCollector: GiveawayCollector | null = null;
let startPromise: Promise<void> | null = null;

export const startEmbeddedCollector = async (): Promise<void> => {
  if (process.env.COLLECTOR_MODE !== "embedded") {
    return;
  }

  if (!isRedisConfigured()) {
    console.warn(
      "[collector:embedded] skipped — REDIS_URL is not configured",
    );
    return;
  }

  if (startPromise) {
    await startPromise;
    return;
  }

  embeddedCollector = new GiveawayCollector();
  startPromise = embeddedCollector.start().catch((error) => {
    embeddedCollector = null;
    startPromise = null;
    throw error;
  });

  await startPromise;
  console.info("[collector:embedded] started inside Next.js process");
};

export const stopEmbeddedCollector = async (): Promise<void> => {
  if (!embeddedCollector) {
    return;
  }

  await embeddedCollector.stop();
  embeddedCollector = null;
  startPromise = null;
};
