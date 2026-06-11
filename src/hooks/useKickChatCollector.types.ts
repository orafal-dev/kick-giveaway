import type { ConnectionStatus } from "@/giveaway/giveaway.types";
import type { GiveawaySessionState } from "@/server/giveaway/giveawaySession.types";

export interface UseKickChatCollectorOptions {
  sessionId: string;
  chatroomId: string | null;
  channelId: string | null;
  channelName: string;
  connectionStatus: ConnectionStatus;
  giveawayStarted: boolean;
  isCountdownActive: boolean;
  isServerReady: boolean;
  serverUnavailable: boolean;
  applyServerState: (state: GiveawaySessionState) => void;
}
