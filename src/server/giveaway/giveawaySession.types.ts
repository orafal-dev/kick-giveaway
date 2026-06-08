import type { KickChatMessage } from "@/App.types";
import type {
  ConnectionStatus,
  Entrant,
  GiveawayPhase,
  GiveawaySettings,
  PendingWinner,
  WinnerConfirmationMessage,
  WinnerRecord,
} from "@/giveaway/giveaway.types";

export interface GiveawaySessionState {
  sessionId: string;
  updatedAt: number;
  lastHeartbeatAt: number;
  channelName: string;
  chatroomId: string | null;
  channelId: string | null;
  channelSubscribersOnly: boolean;
  settings: GiveawaySettings;
  entrants: Entrant[];
  winners: WinnerRecord[];
  phase: GiveawayPhase;
  pendingWinner: PendingWinner | null;
  pendingWinnerMessages: WinnerConfirmationMessage[];
  drawCount: number;
  connectionStatus: ConnectionStatus;
  giveawayStarted: boolean;
  errorMessage: string;
  channelModeMessage: string;
  lastMessages: KickChatMessage[];
  countdownSeconds: number;
  isCountdownActive: boolean;
  drawTarget: Entrant | null;
  isDrawing: boolean;
  displayName: string;
  showConfetti: boolean;
}

export type GiveawaySessionPatch = Partial<
  Omit<GiveawaySessionState, "sessionId" | "updatedAt">
>;

export type CollectorCommandType =
  | "sync"
  | "connect"
  | "disconnect"
  | "stop";

export interface CollectorCommand {
  type: CollectorCommandType;
  sessionId: string;
  issuedAt: number;
}
