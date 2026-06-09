import type {
  AnimationMode,
  Entrant,
  PendingWinner,
} from "@/giveaway/giveaway.types";
import type { OverlayLayoutSettings } from "@/overlay/overlayLayout.types";

export interface OverlayRecentParticipant {
  userId: string;
  username: string;
}

export interface OverlaySyncPayload {
  updatedAt: number;
  drawCount: number;
  channelName: string;
  giveawayStarted: boolean;
  animationMode: AnimationMode;
  animationDurationSeconds: number;
  winnerConfirmationEnabled: boolean;
  isDrawing: boolean;
  drawTarget: Entrant | null;
  drawPool: Entrant[];
  displayName: string;
  pendingWinner: PendingWinner | null;
  countdownSeconds: number;
  isCountdownActive: boolean;
  showConfetti: boolean;
  latestWinnerNoShow: boolean;
  /** Last entrants joined, oldest first (max 5). */
  recentParticipants: OverlayRecentParticipant[];
  layout: OverlayLayoutSettings;
}

export const OVERLAY_BROADCAST_CHANNEL = "kickaway-overlay-v1";
