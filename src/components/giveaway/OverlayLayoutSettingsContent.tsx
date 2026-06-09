import { OverlayLayoutCanvas } from "@/components/giveaway/OverlayLayoutCanvas";
import type { OverlayLayoutSettings } from "@/overlay/overlayLayout.types";

export interface OverlayLayoutSettingsContentProps {
  layout: OverlayLayoutSettings;
  onUpdateLayout: (partial: Partial<OverlayLayoutSettings>) => void;
}

export const OverlayLayoutSettingsContent = ({
  layout,
  onUpdateLayout,
}: OverlayLayoutSettingsContentProps) => {
  return (
    <OverlayLayoutCanvas layout={layout} onUpdateLayout={onUpdateLayout} />
  );
};
