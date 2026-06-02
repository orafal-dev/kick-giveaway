import type { KickChatMessage } from "@/App.types";
import { WinnerChatMessages } from "@/components/giveaway/WinnerChatMessages";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getWinnerChatMessages } from "@/giveaway/winnerChatMessages";
import type {
  PendingWinner,
  WinnerConfirmationMessage,
  WinnerRecord,
} from "@/giveaway/giveaway.types";
import { cn } from "@/lib/utils";

interface WinnersPanelProps {
  winners: WinnerRecord[];
  displayName: string;
  isDrawing: boolean;
  pendingWinner: PendingWinner | null;
  pendingWinnerMessages: WinnerConfirmationMessage[];
  recentChatMessages: KickChatMessage[];
  countdownSeconds: number;
  isCountdownActive: boolean;
  winnerConfirmationEnabled: boolean;
  onManualConfirm: () => void;
}

export const WinnersPanel = ({
  winners,
  displayName,
  isDrawing,
  pendingWinner,
  pendingWinnerMessages,
  recentChatMessages,
  countdownSeconds,
  isCountdownActive,
  winnerConfirmationEnabled,
  onManualConfirm,
}: WinnersPanelProps) => {
  const latestWinner = winners.at(-1);
  const isLatestNoShow =
    latestWinner?.noShow === true &&
    Boolean(displayName) &&
    latestWinner.username.toLowerCase() === displayName.toLowerCase();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Winners ({winners.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-border bg-muted/40 p-6 text-center">
          <p className="mb-2 text-xs uppercase text-muted-foreground">
            {isDrawing ? "Drawing..." : "Current selection"}
          </p>
          <p
            className={cn(
              "text-4xl font-semibold tracking-tight",
              isLatestNoShow ? "text-destructive" : "text-primary",
            )}
          >
            {displayName || "—"}
          </p>
        </div>

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
            <Button type="button" size="sm" onClick={onManualConfirm}>
              Confirm winner
            </Button>
            {pendingWinnerMessages.length > 0 ? (
              <WinnerChatMessages
                className="mt-4"
                username={pendingWinner.username}
                messages={pendingWinnerMessages}
              />
            ) : null}
          </div>
        ) : null}

        <ScrollArea className="h-72 rounded-md border border-border p-2">
          <ul className="space-y-2 text-sm">
            {winners.map((winner) => {
              const winnerMessages = getWinnerChatMessages(
                winner,
                recentChatMessages,
              );

              return (
              <li
                key={`${winner.username}-${winner.drawIndex}`}
                className={
                  winner.noShow
                    ? "space-y-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2"
                    : "space-y-2 rounded-md bg-muted px-3 py-2"
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={
                      winner.noShow
                        ? "font-medium text-destructive"
                        : "font-medium"
                    }
                  >
                    {winner.username}
                  </span>
                  <Badge
                    variant={
                      winner.noShow
                        ? "destructive"
                        : winner.confirmedAt
                          ? "success"
                          : "secondary"
                    }
                  >
                    {winner.noShow
                      ? "No show"
                      : winner.confirmedAt
                        ? "Confirmed"
                        : "Auto"}
                  </Badge>
                </div>
                {!winner.noShow && winnerMessages.length > 0 ? (
                  <WinnerChatMessages
                    username={winner.username}
                    messages={winnerMessages}
                    className="pt-1"
                    showHeading={false}
                  />
                ) : null}
              </li>
            );
            })}
            {winners.length === 0 ? (
              <li className="px-3 py-2 text-muted-foreground">No winners yet.</li>
            ) : null}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
