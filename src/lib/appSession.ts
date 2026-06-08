const APP_SESSION_STORAGE_KEY = "kickaway-app-session-id";
const LEGACY_OVERLAY_SESSION_STORAGE_KEY = "kickaway-overlay-session-id";

const readStoredSessionId = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const fromLocal = window.localStorage.getItem(APP_SESSION_STORAGE_KEY);
  if (fromLocal) {
    return fromLocal;
  }

  const fromSession = window.sessionStorage.getItem(APP_SESSION_STORAGE_KEY);
  if (fromSession) {
    window.localStorage.setItem(APP_SESSION_STORAGE_KEY, fromSession);
    window.sessionStorage.removeItem(APP_SESSION_STORAGE_KEY);
    return fromSession;
  }

  const legacyOverlay = window.sessionStorage.getItem(
    LEGACY_OVERLAY_SESSION_STORAGE_KEY,
  );
  if (legacyOverlay) {
    window.localStorage.setItem(APP_SESSION_STORAGE_KEY, legacyOverlay);
    window.sessionStorage.removeItem(LEGACY_OVERLAY_SESSION_STORAGE_KEY);
    return legacyOverlay;
  }

  return null;
};

/** Persists across tab close so server-side collection stays tied to the same session. */
export const getOrCreateAppSessionId = (): string => {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = readStoredSessionId();
  if (existing) {
    return existing;
  }

  const sessionId = crypto.randomUUID();
  window.localStorage.setItem(APP_SESSION_STORAGE_KEY, sessionId);
  return sessionId;
};
