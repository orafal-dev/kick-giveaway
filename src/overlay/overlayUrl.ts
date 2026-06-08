import { SITE_URL } from "@/config/site";
import { appendOverlayLayoutToSearchParams } from "@/overlay/overlayLayout.utils";
import type { OverlayLayoutSettings } from "@/overlay/overlayLayout.types";

export interface BuildOverlayUrlOptions {
  transparent?: boolean;
  layout?: OverlayLayoutSettings;
}

export const buildOverlayUrl = (
  sessionId: string,
  options: BuildOverlayUrlOptions = {},
): string => {
  const url = new URL("/overlay", SITE_URL);

  if (typeof window !== "undefined" && window.location.origin) {
    url.host = window.location.host;
    url.protocol = window.location.protocol;
  }

  url.searchParams.set("session", sessionId);

  if (options.transparent) {
    url.searchParams.set("transparent", "1");
  }

  if (options.layout) {
    appendOverlayLayoutToSearchParams(url.searchParams, options.layout);
  }

  return url.toString();
};
