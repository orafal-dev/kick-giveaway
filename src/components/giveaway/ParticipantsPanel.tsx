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
      ? "An accepted winner has already been selected."
      : `All ${winnersCount} accepted winners have been selected.`;
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
}

export const ParticipantsPanel = ({
  entrants,
  drawPoolCount,
  giveawayStarted,
  isDrawing,
  winnersTargetReached,
  winnersCount,
  onDrawWinner,
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
      variant="kick"
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col overflow-hidden rounded-md border border-border">
          <ScrollArea className="max-h-[max(calc(100vh-300px),400px)] p-2">
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
            <div className="border-t border-border px-3 py-2">
              <p className="text-xs text-muted-foreground">
                {entrants.length - drawPoolCount} accepted winner(s) excluded from
                the draw pool.
              </p>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};
