export type AnimationMode = "wheel" | "classic" | "scramble";

export type GiveawayPhase =
  | "idle"
  | "connecting"
  | "collecting"
  | "drawing"
  | "awaitingConfirmation"
  | "completed";

export type ConnectionStatus = "idle" | "connecting" | "connected";

export interface GiveawaySettings {
  keyword: string;
  winnersCount: number;
  subscriptionDurationMonths: number;
  subscriberMultiplier: number;
  followDurationDays: number;
  subscribersOnly: boolean;
  winnerConfirmationEnabled: boolean;
  confirmTimeSeconds: number;
  animationMode: AnimationMode;
  /** Total draw animation time (wheel spin + hold, or name roll). */
  animationDurationSeconds: number;
}

export interface Entrant {
  username: string;
  userId: string;
  isSubscriber: boolean;
  isFollower: boolean;
  subscribedMonths: number;
  followedDays: number;
  weight: number;
}

export interface WinnerConfirmationMessage {
  message: string;
  timestamp: number;
}

export interface WinnerRecord {
  username: string;
  userId: string;
  confirmedAt: number | null;
  /** True when confirmation timed out without a chat response. */
  noShow: boolean;
  drawIndex: number;
  /** Chat messages from the winner after they were drawn (confirmation window). */
  confirmationMessages: WinnerConfirmationMessage[];
}

export interface PendingWinner {
  username: string;
  userId: string;
  startedAt: number;
}

export interface PersistedGiveawayState {
  channelName: string;
  settings: GiveawaySettings;
  entrants: Entrant[];
  winners: WinnerRecord[];
  phase: GiveawayPhase;
  pendingWinner: PendingWinner | null;
  drawCount: number;
}

