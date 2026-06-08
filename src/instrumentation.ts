export const register = async (): Promise<void> => {
  if (process.env.NEXT_RUNTIME === "edge") {
    return;
  }

  const { startEmbeddedCollector } = await import(
    "@/server/giveaway/embeddedCollector"
  );

  await startEmbeddedCollector();
};
