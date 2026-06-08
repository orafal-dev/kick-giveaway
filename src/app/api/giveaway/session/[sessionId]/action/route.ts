import { handleSessionAction } from "@/server/giveaway/giveawayApiHandlers";

interface ActionRouteContext {
  params: Promise<{ sessionId: string }>;
}

export const POST = async (
  request: Request,
  context: ActionRouteContext,
): Promise<Response> => {
  const { sessionId } = await context.params;
  return handleSessionAction(sessionId.trim(), request);
};
