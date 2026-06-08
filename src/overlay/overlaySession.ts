const OVERLAY_SESSION_STORAGE_KEY = "kickaway-overlay-session-id";

export const getOrCreateOverlaySessionId = (): string => {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = window.sessionStorage.getItem(OVERLAY_SESSION_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const sessionId = crypto.randomUUID();
  window.sessionStorage.setItem(OVERLAY_SESSION_STORAGE_KEY, sessionId);
  return sessionId;
};
