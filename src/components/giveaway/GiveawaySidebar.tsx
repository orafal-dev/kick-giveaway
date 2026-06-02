import { Settings2Icon } from "lucide-react";
import {
  SettingsForm,
  type SettingsPanelProps,
} from "@/components/giveaway/SettingsPanel";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

type GiveawaySidebarProps = SettingsPanelProps;

export const GiveawaySidebar = (props: GiveawaySidebarProps) => {
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
      </SidebarContent>

      <SidebarFooter className="gap-2">
        <Button
          type="button"
          className="w-full"
          size="2xl"
          onClick={props.onStartGiveaway}
          disabled={props.connectionStatus === "connecting"}
          aria-label="Start giveaway and connect to chat"
          variant="kick"
        >
          {props.giveawayStarted ? "Giveaway Running" : "Start Giveaway"}
        </Button>
        {!props.giveawayStarted ? (
          <p className="text-center text-xs text-muted-foreground">
            Press &quot;Start&quot; to connect to the chat.
          </p>
        ) : null}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};
