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

export interface WinnerRecord {
  username: string;
  confirmedAt: number | null;
  drawIndex: number;
}

export interface PendingWinner {
  username: string;
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

export interface ThemeMode {
  mode: "dark" | "light";
}
