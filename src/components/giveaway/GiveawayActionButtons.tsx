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
  const showClearStoredDataButton =
    !giveawayStarted && hasStoredParticipantsOrWinners;

  return (
    <div className={showClearStoredDataButton ? "flex gap-3" : undefined}>
      <Button
        type="button"
        className={showClearStoredDataButton ? "min-w-0 flex-1" : "w-full"}
        size="2xl"
        onClick={giveawayStarted ? onResetGiveaway : onStartGiveaway}
        disabled={connectionStatus === "connecting"}
        aria-label={
          giveawayStarted
            ? "Reset giveaway to before start"
            : "Start giveaway and connect to chat"
        }
        variant={giveawayStarted ? "secondary" : "kick"}
      >
        {giveawayStarted ? "Reset" : "Start Giveaway"}
      </Button>
      {showClearStoredDataButton ? (
        <Button
          type="button"
          variant="outline"
          size="2xl"
          onClick={onResetGiveaway}
          disabled={connectionStatus === "connecting"}
          aria-label="Clear stored participants and winners"
        >
          Reset
        </Button>
      ) : null}
    </div>
  );
};
