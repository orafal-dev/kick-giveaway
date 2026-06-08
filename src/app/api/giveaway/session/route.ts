import { handleEnsureSession } from "@/server/giveaway/giveawayApiHandlers";

export const POST = async (request: Request): Promise<Response> =>
  handleEnsureSession(request);
