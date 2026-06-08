import { OverlayLayoutForm } from "@/components/giveaway/OverlayLayoutForm";
import type { OverlayLayoutSettings } from "@/overlay/overlayLayout.types";

interface OverlayLayoutPanelProps {
  layout: OverlayLayoutSettings;
  onUpdateLayout: (partial: Partial<OverlayLayoutSettings>) => void;
}

/** @deprecated Overlay layout lives on /overlay-settings. Use OverlayLayoutForm. */
export const OverlayLayoutPanel = ({
  layout,
  onUpdateLayout,
}: OverlayLayoutPanelProps) => {
  return (
    <OverlayLayoutForm layout={layout} onUpdateLayout={onUpdateLayout} />
  );
};
