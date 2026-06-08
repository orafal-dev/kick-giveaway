import {
  handleGetSession,
  handlePatchSession,
} from "@/server/giveaway/giveawayApiHandlers";

interface SessionRouteContext {
  params: Promise<{ sessionId: string }>;
}

export const GET = async (
  _request: Request,
  context: SessionRouteContext,
): Promise<Response> => {
  const { sessionId } = await context.params;
  return handleGetSession(sessionId.trim());
};

export const PATCH = async (
  request: Request,
  context: SessionRouteContext,
): Promise<Response> => {
  const { sessionId } = await context.params;
  return handlePatchSession(sessionId.trim(), request);
};
