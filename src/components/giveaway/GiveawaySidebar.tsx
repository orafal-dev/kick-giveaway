import {
  SettingsForm,
  type SettingsPanelProps,
} from "@/components/giveaway/SettingsPanel";
import { GiveawayActionButtons } from "@/components/giveaway/GiveawayActionButtons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";

export const GiveawaySidebar = (props: SettingsPanelProps) => {
  return (
    <Sidebar
      variant="sidebar"
      collapsible="offcanvas"
      className="border-r border-border/80"
    >
      <SidebarContent className="gap-0 px-4 py-5">
        <SettingsForm {...props} showStartButton={false} />
      </SidebarContent>

      <SidebarFooter className="gap-2 border-t border-border/80 px-4 py-4">
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
