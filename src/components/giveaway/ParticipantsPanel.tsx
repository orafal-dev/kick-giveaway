import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip";
import type { Entrant } from "@/giveaway/giveaway.types";

interface DrawWinnerBlockContext {
  giveawayStarted: boolean;
  drawPoolCount: number;
  entrantsCount: number;
  isDrawing: boolean;
  winnersTargetReached: boolean;
  winnersCount: number;
}

const getDrawWinnerBlockReason = ({
  giveawayStarted,
  drawPoolCount,
  entrantsCount,
  isDrawing,
  winnersTargetReached,
  winnersCount,
}: DrawWinnerBlockContext): string | null => {
  if (!giveawayStarted) {
    return "Start the giveaway before drawing a winner.";
  }

  if (isDrawing) {
    return "A draw is already in progress.";
  }

  if (winnersTargetReached) {
    return winnersCount === 1
      ? "The winner has already been drawn."
      : `All ${winnersCount} winners have been drawn.`;
  }

  if (drawPoolCount === 0) {
    if (entrantsCount === 0) {
      return "No participants yet. Users can enter via chat.";
    }

    return "No eligible participants remain in the draw pool.";
  }

  return null;
};

interface ParticipantsPanelProps {
  entrants: Entrant[];
  drawPoolCount: number;
  giveawayStarted: boolean;
  isDrawing: boolean;
  winnersTargetReached: boolean;
  winnersCount: number;
  onDrawWinner: () => void;
  onReset: () => void;
}

export const ParticipantsPanel = ({
  entrants,
  drawPoolCount,
  giveawayStarted,
  isDrawing,
  winnersTargetReached,
  winnersCount,
  onDrawWinner,
  onReset,
}: ParticipantsPanelProps) => {
  const drawWinnerBlockReason = getDrawWinnerBlockReason({
    giveawayStarted,
    drawPoolCount,
    entrantsCount: entrants.length,
    isDrawing,
    winnersTargetReached,
    winnersCount,
  });
  const isDrawWinnerDisabled = drawWinnerBlockReason !== null;

  const drawWinnerButton = (
    <Button
      type="button"
      onClick={onDrawWinner}
      disabled={isDrawWinnerDisabled}
      aria-label="Draw giveaway winner"
      aria-describedby={
        drawWinnerBlockReason ? "draw-winner-block-reason" : undefined
      }
    >
      {isDrawing ? "Drawing..." : "Draw Winner"}
    </Button>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <CardTitle>Participants ({entrants.length})</CardTitle>
        <div className="flex flex-wrap gap-2">
          {drawWinnerBlockReason ? (
            <Tooltip>
              <TooltipTrigger
                delay={200}
                render={<span className="inline-flex" tabIndex={0} />}
              >
                {drawWinnerButton}
              </TooltipTrigger>
              <TooltipPopup id="draw-winner-block-reason" side="bottom">
                {drawWinnerBlockReason}
              </TooltipPopup>
            </Tooltip>
          ) : (
            drawWinnerButton
          )}
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
