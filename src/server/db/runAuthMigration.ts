import { getMigrations } from "better-auth/db/migration";
import { auth } from "@/lib/auth";
import { isDatabaseConfigured } from "@/server/db/dbConfig";

let migrationPromise: Promise<void> | null = null;

export const ensureAuthMigrations = (): Promise<void> => {
  if (!isDatabaseConfigured()) {
    return Promise.resolve();
  }

  if (!migrationPromise) {
    migrationPromise = (async () => {
      const { runMigrations } = await getMigrations(auth.options);
      await runMigrations();
    })().catch((error: unknown) => {
      migrationPromise = null;
      throw error;
    });
  }

  return migrationPromise;
};
