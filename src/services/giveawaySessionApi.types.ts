import type { Entrant, GiveawaySettings } from "@/giveaway/giveaway.types";
import type { GiveawaySessionState } from "@/server/giveaway/giveawaySession.types";

export type GiveawaySessionAction =
  | "sync"
  | "connect"
  | "start"
  | "reset"
  | "clear"
  | "change-channel"
  | "heartbeat"
  | "draw"
  | "finalize-draw"
  | "confirm"
  | "confetti-complete"
  | "update-drawing-display"
  | "stop";

export interface EnsureGiveawaySessionInput {
  sessionId: string;
  channelName?: string;
  settings?: GiveawaySettings;
}

export interface GiveawaySessionResponse {
  state: GiveawaySessionState;
}

export interface FinalizeDrawInput {
  winner: Entrant;
}

export interface UpdateDrawingDisplayInput {
  displayName: string;
}
