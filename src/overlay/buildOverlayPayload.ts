import type {
  Entrant,
  GiveawaySettings,
  PendingWinner,
  WinnerRecord,
} from "@/giveaway/giveaway.types";
import type { OverlayLayoutSettings } from "@/overlay/overlayLayout.types";
import type { OverlaySyncPayload } from "@/overlay/overlay.types";
import { isCurrentSelectionNoShow } from "@/giveaway/winnerDisplay.utils";

export interface BuildOverlayPayloadInput {
  channelName: string;
  giveawayStarted: boolean;
  settings: GiveawaySettings;
  isDrawing: boolean;
  drawTarget: Entrant | null;
  drawPool: Entrant[];
  displayName: string;
  pendingWinner: PendingWinner | null;
  countdownSeconds: number;
  isCountdownActive: boolean;
  showConfetti: boolean;
  drawCount: number;
  winners: WinnerRecord[];
  entrants: Entrant[];
  layout: OverlayLayoutSettings;
}

export const buildOverlayPayload = ({
  channelName,
  giveawayStarted,
  settings,
  isDrawing,
  drawTarget,
  drawPool,
  displayName,
  pendingWinner,
  countdownSeconds,
  isCountdownActive,
  showConfetti,
  drawCount,
  winners,
  entrants,
  layout,
}: BuildOverlayPayloadInput): OverlaySyncPayload => {
  const latestWinnerNoShow = isCurrentSelectionNoShow(
    displayName,
    winners,
    pendingWinner,
  );

  const recentParticipants = entrants.slice(-5).map((entrant) => ({
    userId: entrant.userId,
    username: entrant.username,
  }));

  return {
    updatedAt: Date.now(),
    drawCount,
    channelName,
    giveawayStarted,
    animationMode: settings.animationMode,
    animationDurationSeconds: settings.animationDurationSeconds,
    winnerConfirmationEnabled: settings.winnerConfirmationEnabled,
    isDrawing,
    drawTarget,
    drawPool,
    displayName,
    pendingWinner,
    countdownSeconds,
    isCountdownActive,
    showConfetti,
    latestWinnerNoShow,
    recentParticipants,
    layout,
  };
};
