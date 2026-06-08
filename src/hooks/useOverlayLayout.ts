import { useCallback, useState } from "react";
import type { OverlayLayoutSettings } from "@/overlay/overlayLayout.types";
import {
  loadStoredOverlayLayout,
  saveStoredOverlayLayout,
} from "@/overlay/overlayLayout.utils";

export const useOverlayLayout = () => {
  const [layout, setLayout] = useState<OverlayLayoutSettings>(
    loadStoredOverlayLayout,
  );
  const [isReady] = useState(true);

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
