"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Entrant } from "@/giveaway/giveaway.types";

const PARTICIPANT_ROW_HEIGHT = 36;
const PARTICIPANT_ROW_GAP = 8;

const ParticipantRow = ({ entrant }: { entrant: Entrant }) => (
  <div className="flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2">
    <span className="truncate">{entrant.username}</span>
    <div className="flex shrink-0 gap-1">
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
  </div>
);

interface DrawWinnerBlockContext {
  giveawayStarted: boolean;
  drawPoolCount: number;
  entrantsCount: number;
  isDrawing: boolean;
  canRerollDraw: boolean;
}

const getDrawWinnerBlockReason = ({
  giveawayStarted,
  drawPoolCount,
  entrantsCount,
  isDrawing,
  canRerollDraw,
}: DrawWinnerBlockContext): string | null => {
  if (!giveawayStarted) {
    return "Start the giveaway before drawing a winner.";
  }

  if (isDrawing) {
    return "A draw is already in progress.";
  }

  if (drawPoolCount === 0 && !canRerollDraw) {
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
  canRerollDraw: boolean;
  onDrawWinner: () => void;
}

export const ParticipantsPanel = ({
  entrants,
  drawPoolCount,
  giveawayStarted,
  isDrawing,
  canRerollDraw,
  onDrawWinner,
}: ParticipantsPanelProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: entrants.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => PARTICIPANT_ROW_HEIGHT,
    gap: PARTICIPANT_ROW_GAP,
    overscan: 12,
  });

  const drawWinnerBlockReason = getDrawWinnerBlockReason({
    giveawayStarted,
    drawPoolCount,
    entrantsCount: entrants.length,
    isDrawing,
    canRerollDraw,
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
    <Card className="flex h-full max-h-full min-h-0 flex-col overflow-hidden">
      <CardHeader className="flex shrink-0 flex-row flex-wrap items-center justify-between gap-3">
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
              <TooltipContent id="draw-winner-block-reason" side="bottom">
                {drawWinnerBlockReason}
              </TooltipContent>
            </Tooltip>
          ) : (
            drawWinnerButton
          )}
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex max-h-full min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border">
          <div
            ref={scrollRef}
            className="max-h-full min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-2 pe-2.5 text-left text-sm"
            aria-label="Participants"
          >
            {entrants.length === 0 ? (
              <p className="px-3 py-2 text-muted-foreground">
                {giveawayStarted
                  ? "No participants yet. Users can enter via chat."
                  : 'Press "Start Giveaway" to connect to the chat.'}
              </p>
            ) : (
              <div
                role="list"
                className="relative w-full"
                style={{ height: virtualizer.getTotalSize() }}
              >
                {virtualizer.getVirtualItems().map((virtualRow) => {
                  const entrant = entrants[virtualRow.index];
                  if (!entrant) {
                    return null;
                  }

                  return (
                    <div
                      key={entrant.userId}
                      role="listitem"
                      className="absolute left-0 top-0 w-full"
                      style={{
                        height: virtualRow.size,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <ParticipantRow entrant={entrant} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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
