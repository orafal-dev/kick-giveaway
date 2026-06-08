import type {
  EnsureGiveawaySessionInput,
  FinalizeDrawInput,
  GiveawaySessionAction,
  GiveawaySessionResponse,
  UpdateDrawingDisplayInput,
} from "@/services/giveawaySessionApi.types";
import type { GiveawaySessionPatch } from "@/server/giveaway/giveawaySession.types";

const parseSessionResponse = async (
  response: Response,
): Promise<GiveawaySessionResponse> => {
  const data = (await response.json()) as GiveawaySessionResponse & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status}).`);
  }

  return data;
};

export const ensureGiveawaySession = async (
  input: EnsureGiveawaySessionInput,
): Promise<GiveawaySessionResponse> => {
  const response = await fetch("/api/giveaway/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseSessionResponse(response);
};

export const fetchGiveawaySession = async (
  sessionId: string,
): Promise<GiveawaySessionResponse> => {
  const response = await fetch(
    `/api/giveaway/session/${encodeURIComponent(sessionId)}`,
    { cache: "no-store" },
  );

  return parseSessionResponse(response);
};

export const patchGiveawaySession = async (
  sessionId: string,
  patch: GiveawaySessionPatch,
): Promise<GiveawaySessionResponse> => {
  const response = await fetch(
    `/api/giveaway/session/${encodeURIComponent(sessionId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    },
  );

  return parseSessionResponse(response);
};

export const runGiveawaySessionAction = async (
  sessionId: string,
  action: GiveawaySessionAction,
  payload: Record<string, unknown> | FinalizeDrawInput | UpdateDrawingDisplayInput = {},
): Promise<GiveawaySessionResponse> => {
  const response = await fetch(
    `/api/giveaway/session/${encodeURIComponent(sessionId)}/action`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...(payload as Record<string, unknown>) }),
    },
  );

  return parseSessionResponse(response);
};

export const finalizeGiveawayDraw = async (
  sessionId: string,
  input: FinalizeDrawInput,
): Promise<GiveawaySessionResponse> =>
  runGiveawaySessionAction(sessionId, "finalize-draw", {
    winner: input.winner,
  });

export const updateGiveawayDrawingDisplay = async (
  sessionId: string,
  input: UpdateDrawingDisplayInput,
): Promise<GiveawaySessionResponse> =>
  runGiveawaySessionAction(sessionId, "update-drawing-display", input);

export const getGiveawaySessionEventsUrl = (sessionId: string): string =>
  `/api/giveaway/session/${encodeURIComponent(sessionId)}/events`;
