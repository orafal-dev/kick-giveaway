import { DismissSliderCard } from "@/components/giveaway/DismissSliderCard";
import type { OverlaySettingsSidebarProps } from "@/components/layout/overlay-settings-sidebar.types";
import { SidebarContent } from "@/components/ui/sidebar";

export const OverlaySettingsPanel = ({
  layout,
  onUpdateLayout,
}: OverlaySettingsSidebarProps) => {
  return (
    <SidebarContent className="gap-0 px-4 py-5">
      <DismissSliderCard
        variant="sidebar"
        resultDismissSeconds={layout.resultDismissSeconds}
        onDismissChange={(seconds) =>
          onUpdateLayout({ resultDismissSeconds: seconds })
        }
      />
    </SidebarContent>
  );
};
