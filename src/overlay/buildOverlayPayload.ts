import type {
  Entrant,
  GiveawaySettings,
  PendingWinner,
  WinnerRecord,
} from "@/giveaway/giveaway.types";
import type { OverlayLayoutSettings } from "@/overlay/overlayLayout.types";
import type { OverlaySyncPayload } from "@/overlay/overlay.types";

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
  layout,
}: BuildOverlayPayloadInput): OverlaySyncPayload => {
  const latestWinner = winners.at(-1);
  const latestWinnerNoShow =
    latestWinner?.noShow === true &&
    Boolean(displayName) &&
    latestWinner.username.toLowerCase() === displayName.toLowerCase();

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
    layout,
  };
};
