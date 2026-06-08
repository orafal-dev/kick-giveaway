import { Settings2Icon } from "lucide-react";
import { OverlayLayoutPanel } from "@/components/giveaway/OverlayLayoutPanel";
import {
  SettingsForm,
  type SettingsPanelProps,
} from "@/components/giveaway/SettingsPanel";
import { GiveawayActionButtons } from "@/components/giveaway/GiveawayActionButtons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { OverlayLayoutSettings } from "@/overlay/overlayLayout.types";

type GiveawaySidebarProps = SettingsPanelProps & {
  overlayLayout: OverlayLayoutSettings;
  onUpdateOverlayLayout: (partial: Partial<OverlayLayoutSettings>) => void;
};

export const GiveawaySidebar = ({
  overlayLayout,
  onUpdateOverlayLayout,
  ...props
}: GiveawaySidebarProps) => {
  return (
    <Sidebar variant="inset" collapsible="offcanvas">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-1 py-0.5">
          <Settings2Icon
            className="size-4 shrink-0 text-sidebar-foreground"
            aria-hidden
          />
          <div className="min-w-0">
            <p className="truncate font-semibold text-sidebar-foreground">
              Settings
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SettingsForm {...props} showStartButton={false} />
        <OverlayLayoutPanel
          layout={overlayLayout}
          onUpdateLayout={onUpdateOverlayLayout}
        />
      </SidebarContent>

      <SidebarFooter className="gap-2">
        <GiveawayActionButtons
          giveawayStarted={props.giveawayStarted}
          connectionStatus={props.connectionStatus}
          hasStoredParticipantsOrWinners={
            props.hasStoredParticipantsOrWinners
          }
          onStartGiveaway={props.onStartGiveaway}
          onResetGiveaway={props.onResetGiveaway}
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};
