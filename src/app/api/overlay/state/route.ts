import {
  getOverlayState,
  setOverlayState,
} from "@/overlay/overlayStateStore";
import { isOverlayLayoutSettings } from "@/overlay/overlayStateEquality";
import type { OverlaySyncPayload } from "@/overlay/overlay.types";

const isOverlaySyncPayload = (value: unknown): value is OverlaySyncPayload => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Record<string, unknown>;
  return (
    typeof data.updatedAt === "number" &&
    typeof data.drawCount === "number" &&
    typeof data.channelName === "string" &&
    typeof data.giveawayStarted === "boolean" &&
    typeof data.animationMode === "string" &&
    typeof data.isDrawing === "boolean" &&
    isOverlayLayoutSettings(data.layout)
  );
};

export const GET = async (request: Request): Promise<Response> => {
  const sessionId = new URL(request.url).searchParams.get("session")?.trim();

  if (!sessionId) {
    return Response.json({ error: "Missing session id." }, { status: 400 });
  }

  const state = getOverlayState(sessionId);

  if (!state) {
    return Response.json({ state: null }, { status: 200 });
  }

  return Response.json({ state }, { status: 200 });
};

export const POST = async (request: Request): Promise<Response> => {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { sessionId, state } = body as {
    sessionId?: unknown;
    state?: unknown;
  };

  if (typeof sessionId !== "string" || !sessionId.trim()) {
    return Response.json({ error: "Missing session id." }, { status: 400 });
  }

  if (!isOverlaySyncPayload(state)) {
    return Response.json({ error: "Invalid overlay state." }, { status: 400 });
  }

  setOverlayState(sessionId.trim(), state);

  return Response.json({ ok: true }, { status: 200 });
};
