import { DEFAULT_SETTINGS } from "@/giveaway/giveaway.constants";
import type { Entrant, GiveawaySettings } from "@/giveaway/giveaway.types";
import {
  clearConfettiInState,
  confirmWinnerInState,
  createInitialSessionState,
  finalizeDrawInState,
  startDrawInState,
} from "@/server/giveaway/giveawaySessionLogic";
import type { GiveawaySessionPatch } from "@/server/giveaway/giveawaySession.types";
import {
  deleteSessionState,
  ensureSessionState,
  getSessionState,
  mutateSessionState,
  recordSessionHeartbeat,
  replaceSessionState,
  requestCollectorConnect,
  requestCollectorStop,
  requestCollectorSync,
  syncSessionSettings,
  updateSessionState,
} from "@/server/giveaway/giveawaySessionStore";
import { isRedisConfigured } from "@/server/redis/redisConfig";

export const requireRedis = (): Response | null => {
  if (!isRedisConfigured()) {
    return Response.json(
      { error: "Server-side giveaway collection is not configured." },
      { status: 503 },
    );
  }

  return null;
};

const parseSettings = (value: unknown): GiveawaySettings | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const existing = { ...DEFAULT_SETTINGS };
  const data = value as Partial<GiveawaySettings>;

  return {
    ...existing,
    ...data,
    ignoredNicks: Array.isArray(data.ignoredNicks)
      ? data.ignoredNicks.filter((nick): nick is string => typeof nick === "string")
      : existing.ignoredNicks,
  };
};

export const handleEnsureSession = async (request: Request): Promise<Response> => {
  const redisError = requireRedis();
  if (redisError) {
    return redisError;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const data = (body ?? {}) as {
    sessionId?: unknown;
    channelName?: unknown;
    settings?: unknown;
  };

  const sessionId =
    typeof data.sessionId === "string" ? data.sessionId.trim() : "";
  if (!sessionId) {
    return Response.json({ error: "Missing session id." }, { status: 400 });
  }

  const channelName =
    typeof data.channelName === "string" ? data.channelName : undefined;
  const settings = parseSettings(data.settings) ?? undefined;

  const state = await ensureSessionState(sessionId, { channelName, settings });
  return Response.json({ state }, { status: 200 });
};

export const handleGetSession = async (sessionId: string): Promise<Response> => {
  const redisError = requireRedis();
  if (redisError) {
    return redisError;
  }

  const state = await getSessionState(sessionId);
  if (!state) {
    return Response.json({ error: "Session not found." }, { status: 404 });
  }

  return Response.json({ state }, { status: 200 });
};

export const handlePatchSession = async (
  sessionId: string,
  request: Request,
): Promise<Response> => {
  const redisError = requireRedis();
  if (redisError) {
    return redisError;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const patch = body as GiveawaySessionPatch;

  if (patch.settings) {
    const parsedSettings = parseSettings(patch.settings);
    if (!parsedSettings) {
      return Response.json({ error: "Invalid settings." }, { status: 400 });
    }

    const state = await syncSessionSettings(sessionId, parsedSettings);
    if (!state) {
      return Response.json({ error: "Session not found." }, { status: 404 });
    }

    return Response.json({ state }, { status: 200 });
  }

  const state = await updateSessionState(sessionId, patch);
  if (!state) {
    return Response.json({ error: "Session not found." }, { status: 404 });
  }

  const shouldSyncCollector =
    patch.chatroomId !== undefined ||
    patch.channelId !== undefined ||
    patch.connectionStatus === "connecting";

  if (shouldSyncCollector) {
    await requestCollectorSync(sessionId);
  }

  return Response.json({ state }, { status: 200 });
};

export const handleSessionAction = async (
  sessionId: string,
  request: Request,
): Promise<Response> => {
  const redisError = requireRedis();
  if (redisError) {
    return redisError;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const action =
    body && typeof body === "object" && typeof (body as { action?: unknown }).action === "string"
      ? (body as { action: string }).action
      : "";

  switch (action) {
    case "sync":
      return handleSync(sessionId);
    case "connect":
      return handleConnect(sessionId);
    case "start":
      return handleStart(sessionId);
    case "reset":
      return handleReset(sessionId);
    case "clear":
      return handleClear(sessionId);
    case "change-channel":
      return handleChangeChannel(sessionId);
    case "heartbeat":
      return handleHeartbeat(sessionId);
    case "draw":
      return handleDraw(sessionId);
    case "finalize-draw":
      return handleFinalizeDraw(sessionId, body);
    case "confirm":
      return handleConfirm(sessionId);
    case "confetti-complete":
      return handleConfettiComplete(sessionId);
    case "update-drawing-display":
      return handleUpdateDrawingDisplay(sessionId, body);
    case "stop":
      return handleStop(sessionId);
    default:
      return Response.json({ error: "Unknown action." }, { status: 400 });
  }
};

const handleSync = async (sessionId: string): Promise<Response> => {
  const existing = await getSessionState(sessionId);
  if (!existing) {
    return Response.json({ error: "Session not found." }, { status: 404 });
  }

  await requestCollectorSync(sessionId);
  const state = (await getSessionState(sessionId)) ?? existing;
  return Response.json({ state }, { status: 200 });
};

const handleConnect = async (sessionId: string): Promise<Response> => {
  const existing = await getSessionState(sessionId);
  if (!existing) {
    return Response.json({ error: "Session not found." }, { status: 404 });
  }

  if (!existing.channelName.trim()) {
    return Response.json({ error: "Enter a Kick channel name." }, { status: 400 });
  }

  if (!existing.chatroomId) {
    return Response.json(
      {
        error:
          "Channel metadata is missing. Reload the channel step so the app can resolve it from Kick.",
      },
      { status: 400 },
    );
  }

  const state = await updateSessionState(sessionId, {
    connectionStatus: "connecting",
    phase: existing.giveawayStarted ? "connecting" : "idle",
    errorMessage: "",
    channelModeMessage: "",
  });

  await requestCollectorConnect(sessionId);
  return Response.json({ state }, { status: 200 });
};

const handleStart = async (sessionId: string): Promise<Response> => {
  const existing = await getSessionState(sessionId);
  if (!existing) {
    return Response.json({ error: "Session not found." }, { status: 404 });
  }

  if (!existing.channelName.trim()) {
    return Response.json({ error: "Enter a Kick channel name." }, { status: 400 });
  }

  if (!existing.chatroomId) {
    return Response.json(
      {
        error:
          "Channel metadata is missing. Reconnect the channel before starting the giveaway.",
      },
      { status: 400 },
    );
  }

  let state = await updateSessionState(sessionId, {
    giveawayStarted: true,
    errorMessage: "",
    phase:
      existing.connectionStatus === "connected" ? "collecting" : "connecting",
  });

  if (!state) {
    return Response.json({ error: "Session not found." }, { status: 404 });
  }

  if (state.connectionStatus !== "connected") {
    await requestCollectorConnect(sessionId);
    return Response.json({ state }, { status: 200 });
  }

  await requestCollectorSync(sessionId);

  const { seedDevEntrants } = await import(
    "@/server/giveaway/giveawaySessionLogic"
  );
  const { devMode } = await import("@/config/devMode");

  state = await replaceSessionState(
    seedDevEntrants(state, devMode.enabled, devMode.mockEntrantCount),
  );

  return Response.json({ state }, { status: 200 });
};

const handleReset = async (sessionId: string): Promise<Response> => {
  const existing = await getSessionState(sessionId);
  if (!existing) {
    return Response.json({ error: "Session not found." }, { status: 404 });
  }

  const state = await updateSessionState(sessionId, {
    giveawayStarted: false,
    phase: "idle",
    entrants: [],
    winners: [],
    pendingWinner: null,
    pendingWinnerMessages: [],
    drawCount: 0,
    isDrawing: false,
    drawTarget: null,
    displayName: "",
    showConfetti: false,
    isCountdownActive: false,
    countdownSeconds: existing.settings.confirmTimeSeconds,
  });

  return Response.json({ state }, { status: 200 });
};

const handleClear = async (sessionId: string): Promise<Response> => {
  await requestCollectorStop(sessionId);
  await deleteSessionState(sessionId);

  const state = createInitialSessionState(sessionId);
  await replaceSessionState(state);

  return Response.json({ state }, { status: 200 });
};

const handleChangeChannel = async (sessionId: string): Promise<Response> => {
  await requestCollectorStop(sessionId);

  const state = await updateSessionState(sessionId, {
    giveawayStarted: false,
    phase: "idle",
    connectionStatus: "idle",
    chatroomId: null,
    channelId: null,
    channelSubscribersOnly: false,
    pendingWinner: null,
    pendingWinnerMessages: [],
    isDrawing: false,
    drawTarget: null,
    displayName: "",
    isCountdownActive: false,
    showConfetti: false,
    errorMessage: "",
    channelModeMessage: "",
  });

  return Response.json({ state }, { status: 200 });
};

const handleHeartbeat = async (sessionId: string): Promise<Response> => {
  const state = await recordSessionHeartbeat(sessionId);
  if (!state) {
    return Response.json({ error: "Session not found." }, { status: 404 });
  }

  return Response.json({ state }, { status: 200 });
};

const handleDraw = async (sessionId: string): Promise<Response> => {
  const state = await mutateSessionState(sessionId, startDrawInState);
  if (!state) {
    return Response.json({ error: "Session not found." }, { status: 404 });
  }

  return Response.json({ state }, { status: 200 });
};

const handleFinalizeDraw = async (
  sessionId: string,
  body: unknown,
): Promise<Response> => {
  const winner =
    body &&
    typeof body === "object" &&
    (body as { winner?: unknown }).winner &&
    typeof (body as { winner: Entrant }).winner === "object"
      ? (body as { winner: Entrant }).winner
      : null;

  if (!winner || typeof winner.username !== "string") {
    return Response.json({ error: "Missing winner." }, { status: 400 });
  }

  const state = await mutateSessionState(sessionId, (current) =>
    finalizeDrawInState(current, winner),
  );

  if (!state) {
    return Response.json({ error: "Session not found." }, { status: 404 });
  }

  return Response.json({ state }, { status: 200 });
};

const handleConfirm = async (sessionId: string): Promise<Response> => {
  const existing = await getSessionState(sessionId);
  if (!existing?.pendingWinner) {
    return Response.json({ error: "No pending winner." }, { status: 400 });
  }

  const state = await mutateSessionState(sessionId, (current) =>
    current.pendingWinner
      ? confirmWinnerInState(current, current.pendingWinner.username, {
          confirmationMessages: current.pendingWinnerMessages,
        })
      : current,
  );

  if (!state) {
    return Response.json({ error: "Session not found." }, { status: 404 });
  }

  return Response.json({ state }, { status: 200 });
};

const handleConfettiComplete = async (sessionId: string): Promise<Response> => {
  const state = await mutateSessionState(sessionId, clearConfettiInState);
  if (!state) {
    return Response.json({ error: "Session not found." }, { status: 404 });
  }

  return Response.json({ state }, { status: 200 });
};

const handleUpdateDrawingDisplay = async (
  sessionId: string,
  body: unknown,
): Promise<Response> => {
  const displayName =
    body &&
    typeof body === "object" &&
    typeof (body as { displayName?: unknown }).displayName === "string"
      ? (body as { displayName: string }).displayName
      : null;

  if (displayName === null) {
    return Response.json({ error: "Missing display name." }, { status: 400 });
  }

  const state = await updateSessionState(sessionId, { displayName });
  if (!state) {
    return Response.json({ error: "Session not found." }, { status: 404 });
  }

  return Response.json({ state }, { status: 200 });
};

const handleStop = async (sessionId: string): Promise<Response> => {
  await requestCollectorStop(sessionId);

  const state = await updateSessionState(sessionId, {
    giveawayStarted: false,
    phase: "idle",
    connectionStatus: "idle",
  });

  return Response.json({ state }, { status: 200 });
};
