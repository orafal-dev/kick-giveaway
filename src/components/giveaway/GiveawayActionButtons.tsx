import { PlayIcon, RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GiveawayActionButtonsProps {
  giveawayStarted: boolean;
  connectionStatus: "idle" | "connecting" | "connected";
  hasStoredParticipantsOrWinners: boolean;
  onStartGiveaway: () => void;
  onResetGiveaway: () => void;
}

export const GiveawayActionButtons = ({
  giveawayStarted,
  connectionStatus,
  hasStoredParticipantsOrWinners,
  onStartGiveaway,
  onResetGiveaway,
}: GiveawayActionButtonsProps) => {
  const handleReset = (): void => {
    onResetGiveaway();
  };

  const showReset =
    giveawayStarted || (!giveawayStarted && hasStoredParticipantsOrWinners);

  return (
    <div className="flex gap-2">
      {showReset ? (
        <Button
          type="button"
          className="min-w-0 flex-1 border-border/80 bg-[#1c1c1f]"
          size="2xl"
          variant="outline"
          onClick={handleReset}
          disabled={connectionStatus === "connecting"}
          aria-label={
            giveawayStarted
              ? "Reset giveaway to before start"
              : "Clear stored participants and winners"
          }
        >
          <RotateCcwIcon aria-hidden="true" />
          Reset
        </Button>
      ) : null}
      {!giveawayStarted ? (
        <Button
          type="button"
          className={showReset ? "min-w-0 flex-[1.4]" : "w-full"}
          size="2xl"
          variant="kick"
          onClick={onStartGiveaway}
          disabled={connectionStatus === "connecting"}
          aria-label="Start giveaway and connect to chat"
        >
          <PlayIcon aria-hidden="true" />
          Start
        </Button>
      ) : null}
    </div>
  );
};
