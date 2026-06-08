import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { anonymous } from "better-auth/plugins";
import { getDbPool } from "@/server/db/dbPool";
import { isDatabaseConfigured } from "@/server/db/dbConfig";

const getTrustedOrigins = (): string[] => {
  const origins = new Set<string>(["http://localhost:3000"]);

  const authUrl = process.env.BETTER_AUTH_URL?.trim();
  if (authUrl) {
    origins.add(authUrl);
  }

  return [...origins];
};

export const auth = betterAuth({
  appName: "kickaway.win",
  database: isDatabaseConfigured() ? getDbPool() : undefined,
  trustedOrigins: getTrustedOrigins(),
  plugins: [anonymous(), nextCookies()],
});
