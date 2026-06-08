import { DismissSliderCard } from "@/components/giveaway/DismissSliderCard";
import { ObsOverlayCard } from "@/components/giveaway/ObsOverlayCard";
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
    <div className="flex flex-col gap-4">
      <ObsOverlayCard layout={layout} onUpdateLayout={onUpdateLayout} />
      <DismissSliderCard
        resultDismissSeconds={layout.resultDismissSeconds}
        onDismissChange={(seconds) =>
          onUpdateLayout({ resultDismissSeconds: seconds })
        }
      />
    </div>
  );
};
