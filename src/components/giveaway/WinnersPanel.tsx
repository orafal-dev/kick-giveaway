import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { WinnerRecord } from "@/giveaway/giveaway.types";

interface WinnersPanelProps {
  winners: WinnerRecord[];
  displayName: string;
  isDrawing: boolean;
}

export const WinnersPanel = ({
  winners,
  displayName,
  isDrawing,
}: WinnersPanelProps) => {
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
          <p className="text-4xl font-semibold tracking-tight text-primary">
            {displayName || "—"}
          </p>
        </div>

        <ScrollArea className="h-48 rounded-md border border-border p-2">
          <ul className="space-y-2 text-sm">
            {winners.map((winner) => (
              <li
                key={`${winner.username}-${winner.drawIndex}`}
                className="flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2"
              >
                <span className="font-medium">{winner.username}</span>
                <Badge variant={winner.confirmedAt ? "success" : "secondary"}>
                  {winner.confirmedAt ? "Confirmed" : "Auto"}
                </Badge>
              </li>
            ))}
            {winners.length === 0 ? (
              <li className="px-3 py-2 text-muted-foreground">No winners yet.</li>
            ) : null}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
