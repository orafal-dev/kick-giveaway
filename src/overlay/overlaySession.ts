import { getOrCreateAppSessionId } from "@/lib/appSession";

/** Overlay and giveaway share one browser session id. */
export const getOrCreateOverlaySessionId = (): string =>
  getOrCreateAppSessionId();
