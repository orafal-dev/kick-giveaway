import type { OverlaySyncPayload } from "@/overlay/overlay.types";

const OVERLAY_STATE_TTL_MS = 60 * 60 * 1_000;

interface OverlayStateEntry {
  state: OverlaySyncPayload;
  updatedAt: number;
}

const overlayStateBySession = new Map<string, OverlayStateEntry>();

const pruneExpiredEntries = (): void => {
  const now = Date.now();

  for (const [sessionId, entry] of overlayStateBySession) {
    if (now - entry.updatedAt > OVERLAY_STATE_TTL_MS) {
      overlayStateBySession.delete(sessionId);
    }
  }
};

export const setOverlayState = (
  sessionId: string,
  state: OverlaySyncPayload,
): void => {
  pruneExpiredEntries();
  overlayStateBySession.set(sessionId, {
    state,
    updatedAt: Date.now(),
  });
};

export const getOverlayState = (
  sessionId: string,
): OverlaySyncPayload | null => {
  pruneExpiredEntries();

  const entry = overlayStateBySession.get(sessionId);
  if (!entry) {
    return null;
  }

  if (Date.now() - entry.updatedAt > OVERLAY_STATE_TTL_MS) {
    overlayStateBySession.delete(sessionId);
    return null;
  }

  return entry.state;
};
