import { MoreHorizontalIcon } from "lucide-react";
import { ObsOverlayActions } from "@/components/giveaway/ObsOverlayActions";
import { Button } from "@/components/ui/button";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@/components/ui/menu";

import type { OverlayLayoutSettings } from "@/overlay/overlayLayout.types";

interface ConnectionBarProps {
  channelName: string;
  overlaySessionId?: string;
  overlayLayout?: OverlayLayoutSettings;
  devModeActive?: boolean;
  devMockCount?: number;
  onChangeChannel: () => void;
  onClearAllData: () => void;
}

export const ConnectionBar = ({
  channelName,
  overlaySessionId,
  overlayLayout,
  onChangeChannel,
  onClearAllData,
}: ConnectionBarProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-semibold text-foreground">{channelName}</span>
      <Menu>
        <MenuTrigger
          aria-label="Channel options"
          render={<Button size="icon-xs" variant="ghost" />}
        >
          <MoreHorizontalIcon />
        </MenuTrigger>
        <MenuPopup align="end" side="bottom">
          <MenuItem onClick={onChangeChannel}>Change Channel</MenuItem>
          <MenuItem onClick={onClearAllData} variant="destructive">
            Clear All Data
          </MenuItem>
        </MenuPopup>
      </Menu>
      {overlaySessionId && overlayLayout ? (
        <ObsOverlayActions
          sessionId={overlaySessionId}
          layout={overlayLayout}
        />
      ) : null}
    </div>
  );
};
