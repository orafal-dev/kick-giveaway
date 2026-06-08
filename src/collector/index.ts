import { GiveawayCollector } from "@/collector/GiveawayCollector";

const collector = new GiveawayCollector();

const shutdown = async (): Promise<void> => {
  console.info("[collector] shutting down");
  await collector.stop();
  process.exit(0);
};

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});

void collector.start().catch((error) => {
  console.error("[collector] failed to start", error);
  process.exit(1);
});
