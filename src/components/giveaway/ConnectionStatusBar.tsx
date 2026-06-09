import {
  CheckCircle2Icon,
  ExternalLinkIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import { ObsOverlayActions } from "@/components/giveaway/ObsOverlayActions";
import { Button } from "@/components/ui/button";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@/components/ui/menu";
import type { ConnectionStatus } from "@/giveaway/giveaway.types";
import type { OverlayLayoutSettings } from "@/overlay/overlayLayout.types";
import { cn } from "@/lib/utils";

interface ConnectionStatusBarProps {
  channelName: string;
  connectionStatus: ConnectionStatus;
  giveawayStarted: boolean;
  entrantCount: number;
  overlaySessionId?: string;
  overlayLayout?: OverlayLayoutSettings;
  onChangeChannel: () => void;
  onClearAllData: () => void;
}

const KickMark = () => (
  <span
    className="flex size-8 shrink-0 items-center justify-center rounded-md bg-kick text-sm font-bold text-kick-foreground"
    aria-hidden="true"
  >
    K
  </span>
);

export const ConnectionStatusBar = ({
  channelName,
  connectionStatus,
  giveawayStarted,
  entrantCount,
  overlaySessionId,
  overlayLayout,
  onChangeChannel,
  onClearAllData,
}: ConnectionStatusBarProps) => {
  const chatConnected =
    giveawayStarted && connectionStatus === "connected";
  const chatStatusLabel = chatConnected
    ? "Connected"
    : connectionStatus === "connecting"
      ? "Connecting"
      : "Idle";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card px-4 py-3 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <KickMark />
          <p className="truncate text-sm">
            <span className="text-muted-foreground">Connected as </span>
            <span className="font-semibold text-foreground">{channelName}</span>
          </p>
          {chatConnected ? (
            <CheckCircle2Icon
              className="size-4 shrink-0 text-kick"
              aria-label="Connected"
            />
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span
              className={cn(
                "size-2 rounded-full",
                chatConnected ? "bg-kick" : "bg-muted-foreground/45",
              )}
              aria-hidden="true"
            />
            Chat:{" "}
            <span className="font-medium text-foreground">{chatStatusLabel}</span>
          </span>

          <span className="inline-flex items-center gap-1 text-muted-foreground">
            Channel:{" "}
            <a
              href={`https://kick.com/${encodeURIComponent(channelName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-foreground hover:text-kick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {channelName}
              <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
            </a>
          </span>

          <span className="text-muted-foreground">
            Entrants:{" "}
            <span className="font-medium text-foreground">{entrantCount}</span>
          </span>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {overlaySessionId && overlayLayout ? (
          <ObsOverlayActions
            sessionId={overlaySessionId}
            layout={overlayLayout}
          />
        ) : null}
        <Menu>
          <MenuTrigger
            aria-label="Channel options"
            render={<Button size="icon-xs" variant="ghost" />}
          >
            <MoreHorizontalIcon />
          </MenuTrigger>
          <MenuPopup align="end" side="bottom">
            <MenuItem onClick={onChangeChannel}>Change channel</MenuItem>
            <MenuItem onClick={onClearAllData} variant="destructive">
              Clear all data
            </MenuItem>
          </MenuPopup>
        </Menu>
      </div>
    </div>
  );
};
