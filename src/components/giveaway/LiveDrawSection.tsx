import { ParticipantsPanel } from "@/components/giveaway/ParticipantsPanel";
import { WinnersPanel } from "@/components/giveaway/WinnersPanel";
import type {
  Entrant,
  PendingWinner,
  WinnerConfirmationMessage,
  WinnerRecord,
} from "@/giveaway/giveaway.types";
import type { KickChatMessage } from "@/App.types";
import { cn } from "@/lib/utils";

interface LiveDrawSectionProps {
  entrants: Entrant[];
  drawPoolCount: number;
  giveawayStarted: boolean;
  isDrawing: boolean;
  winnersTargetReached: boolean;
  winnersCount: number;
  onDrawWinner: () => void;
  winners: WinnerRecord[];
  displayName: string;
  pendingWinner: PendingWinner | null;
  pendingWinnerMessages: WinnerConfirmationMessage[];
  recentChatMessages: KickChatMessage[];
  countdownSeconds: number;
  isCountdownActive: boolean;
  winnerConfirmationEnabled: boolean;
  onManualConfirm: () => void;
  className?: string;
}

export const LiveDrawSection = ({
  entrants,
  drawPoolCount,
  giveawayStarted,
  isDrawing,
  winnersTargetReached,
  winnersCount,
  onDrawWinner,
  winners,
  displayName,
  pendingWinner,
  pendingWinnerMessages,
  recentChatMessages,
  countdownSeconds,
  isCountdownActive,
  winnerConfirmationEnabled,
  onManualConfirm,
  className,
}: LiveDrawSectionProps) => {
  return (
    <section
      className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", className)}
    >
      <header className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Participants & winners</h2>
        <p className="text-xs text-muted-foreground">
          {entrants.length} entered · {winners.length} won
        </p>
      </header>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2 lg:items-stretch [&>*]:min-h-0">
        <ParticipantsPanel
          entrants={entrants}
          drawPoolCount={drawPoolCount}
          giveawayStarted={giveawayStarted}
          isDrawing={isDrawing}
          winnersTargetReached={winnersTargetReached}
          winnersCount={winnersCount}
          onDrawWinner={onDrawWinner}
        />
        <WinnersPanel
          winners={winners}
          displayName={displayName}
          isDrawing={isDrawing}
          pendingWinner={pendingWinner}
          pendingWinnerMessages={pendingWinnerMessages}
          recentChatMessages={recentChatMessages}
          countdownSeconds={countdownSeconds}
          isCountdownActive={isCountdownActive}
          winnerConfirmationEnabled={winnerConfirmationEnabled}
          onManualConfirm={onManualConfirm}
        />
      </div>
    </section>
  );
};
