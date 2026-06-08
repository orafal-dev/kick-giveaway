import { useEffect, useState } from "react";
import { OVERLAY_RESULT_FADE_MS } from "@/overlay/overlayLayout.constants";

interface UseOverlayResultDismissResult {
  dismissed: boolean;
  fading: boolean;
}

export const useOverlayResultDismiss = (
  active: boolean,
  dismissSeconds: number,
  resetKey: string,
): UseOverlayResultDismissResult => {
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  const [dismissed, setDismissed] = useState(false);
  const [fading, setFading] = useState(false);

  if (prevResetKey !== resetKey) {
    setPrevResetKey(resetKey);
    setDismissed(false);
    setFading(false);
  }

  useEffect(() => {
    if (!active || dismissSeconds <= 0) {
      return;
    }

    const hideAtMs = dismissSeconds * 1_000;
    const fadeAtMs = Math.max(0, hideAtMs - OVERLAY_RESULT_FADE_MS);

    const fadeTimer = window.setTimeout(() => {
      setFading(true);
    }, fadeAtMs);

    const hideTimer = window.setTimeout(() => {
      setDismissed(true);
    }, hideAtMs);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [active, dismissSeconds, resetKey]);

  return { dismissed, fading };
};
