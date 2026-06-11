export const register = async (): Promise<void> => {
  if (process.env.NEXT_RUNTIME === "edge") {
    return;
  }

  const { ensureAuthMigrations } = await import("@/server/db/runAuthMigration");
  await ensureAuthMigrations();
};
