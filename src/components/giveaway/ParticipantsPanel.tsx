import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Entrant, PendingWinner } from "@/giveaway/giveaway.types";

interface ParticipantsPanelProps {
  entrants: Entrant[];
  drawPoolCount: number;
  giveawayStarted: boolean;
  isDrawing: boolean;
  winnersTargetReached: boolean;
  pendingWinner: PendingWinner | null;
  countdownSeconds: number;
  isCountdownActive: boolean;
  winnerConfirmationEnabled: boolean;
  onDrawWinner: () => void;
  onReset: () => void;
  onManualConfirm: () => void;
}

export const ParticipantsPanel = ({
  entrants,
  drawPoolCount,
  giveawayStarted,
  isDrawing,
  winnersTargetReached,
  pendingWinner,
  countdownSeconds,
  isCountdownActive,
  winnerConfirmationEnabled,
  onDrawWinner,
  onReset,
  onManualConfirm,
}: ParticipantsPanelProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <CardTitle>Participants ({entrants.length})</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={onDrawWinner}
            disabled={
              !giveawayStarted ||
              drawPoolCount === 0 ||
              isDrawing ||
              winnersTargetReached
            }
            aria-label="Draw giveaway winner"
          >
            {isDrawing ? "Drawing..." : "Draw Winner"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onReset}
            aria-label="Reset giveaway participants and winners"
          >
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingWinner && winnerConfirmationEnabled ? (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
            <h3 className="mb-2 font-semibold text-amber-400">
              Awaiting Confirmation
            </h3>
            <p className="mb-3 text-sm text-muted-foreground">
              Waiting for{" "}
              <strong className="text-foreground">
                {pendingWinner.username}
              </strong>{" "}
              to chat
              {isCountdownActive ? ` (${countdownSeconds}s left)` : ""}.
            </p>
            <Button
              type="button"
              size="sm"
              onClick={onManualConfirm}
              aria-label="Manually confirm winner"
            >
              OK
            </Button>
          </div>
        ) : null}

        <ScrollArea className="max-h-[max(calc(100vh-300px),400px)] rounded-md border border-border p-2">
          <ul className="space-y-2 text-left text-sm">
            {entrants.map((entrant) => (
              <li
                key={entrant.userId}
                className="flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2"
              >
                <span>{entrant.username}</span>
                <div className="flex gap-1">
                  {entrant.isSubscriber ? (
                    <Badge variant="secondary" className="text-xs">
                      Sub
                    </Badge>
                  ) : null}
                  {entrant.weight > 1 ? (
                    <Badge variant="outline" className="text-xs">
                      {entrant.weight}x
                    </Badge>
                  ) : null}
                </div>
              </li>
            ))}
            {entrants.length === 0 ? (
              <li className="px-3 py-2 text-muted-foreground">
                {giveawayStarted
                  ? "No participants yet. Users can enter via chat."
                  : 'Press "Start Giveaway" to connect to the chat.'}
              </li>
            ) : null}
          </ul>
        </ScrollArea>
        {drawPoolCount < entrants.length ? (
          <p className="text-xs text-muted-foreground">
            {entrants.length - drawPoolCount} previous winner(s) excluded from
            the draw pool.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
};
