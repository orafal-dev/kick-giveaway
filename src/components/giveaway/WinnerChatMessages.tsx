import type { WinnerConfirmationMessage } from "@/giveaway/giveaway.types";
import { cn } from "@/lib/utils";

interface WinnerChatMessagesProps {
  username: string;
  messages: WinnerConfirmationMessage[];
  className?: string;
  showHeading?: boolean;
}

const formatMessageTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const WinnerChatMessages = ({
  username,
  messages,
  className,
  showHeading = true,
}: WinnerChatMessagesProps) => {
  if (messages.length === 0) {
    return null;
  }

  const orderedMessages = [...messages].sort(
    (left, right) => left.timestamp - right.timestamp,
  );

  return (
    <div className={cn("space-y-2", className)}>
      {showHeading ? (
        <h3 className="text-sm font-semibold text-foreground">
          Chat from {username}
        </h3>
      ) : null}
      <ul
        className="max-h-40 space-y-2 overflow-y-auto rounded-md border border-border bg-background/60 p-2 text-sm"
        aria-label={`Recent chat messages from ${username}`}
      >
        {orderedMessages.map((entry) => (
          <li
            key={`${entry.timestamp}-${entry.message}`}
            className="rounded-md bg-muted/60 px-2 py-1.5"
          >
            <p className="text-foreground">{entry.message}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatMessageTime(entry.timestamp)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};
