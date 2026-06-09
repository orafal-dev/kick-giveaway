import {
  SettingsForm,
  type SettingsPanelProps,
} from "@/components/giveaway/SettingsPanel";
import { GiveawayActionButtons } from "@/components/giveaway/GiveawayActionButtons";
import { SidebarContent, SidebarFooter } from "@/components/ui/sidebar";

export const GiveawaySettingsPanel = (props: SettingsPanelProps) => {
  return (
    <>
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
    </>
  );
};
