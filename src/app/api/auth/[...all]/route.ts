import { auth } from "@/lib/auth";
import { ensureAuthMigrations } from "@/server/db/runAuthMigration";
import { toNextJsHandler } from "better-auth/next-js";

export const runtime = "nodejs";

const handler = toNextJsHandler(auth);

const withMigrations =
  (method: (request: Request) => Promise<Response>) =>
  async (request: Request): Promise<Response> => {
    await ensureAuthMigrations();
    return method(request);
  };

export const GET = withMigrations(handler.GET);
export const POST = withMigrations(handler.POST);
