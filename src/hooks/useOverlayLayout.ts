import { useCallback, useLayoutEffect, useState } from "react";
import { DEFAULT_OVERLAY_LAYOUT } from "@/overlay/overlayLayout.constants";
import type { OverlayLayoutSettings } from "@/overlay/overlayLayout.types";
import {
  loadStoredOverlayLayout,
  saveStoredOverlayLayout,
} from "@/overlay/overlayLayout.utils";

export const useOverlayLayout = () => {
  const [layout, setLayout] = useState<OverlayLayoutSettings>({
    ...DEFAULT_OVERLAY_LAYOUT,
  });
  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    setLayout(loadStoredOverlayLayout());
    setIsReady(true);
  }, []);

  const updateLayout = useCallback(
    (partial: Partial<OverlayLayoutSettings>): void => {
      setLayout((previous) => {
        const next = { ...previous, ...partial };
        saveStoredOverlayLayout(next);
        return next;
      });
    },
    [],
  );

  return {
    layout,
    updateLayout,
    isReady,
  };
};
