import { DrawAnimation } from "@/components/giveaway/DrawAnimation";
import { WheelPickerDrawAnimation } from "@/components/giveaway/WheelPickerDrawAnimation";
import type { AnimationMode, Entrant } from "@/giveaway/giveaway.types";

interface DrawingOverlayProps {
  isVisible: boolean;
  mode: AnimationMode;
  entrants: Entrant[];
  winner: Entrant;
  displayName: string;
  onDisplayChange: (username: string) => void;
  onComplete: (winner: Entrant) => void;
}

export const DrawingOverlay = ({
  isVisible,
  mode,
  entrants,
  winner,
  displayName,
  onDisplayChange,
  onComplete,
}: DrawingOverlayProps) => {
  if (!isVisible) {
    return null;
  }

  const isWheelMode = mode === "wheel";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Drawing winner"
    >
      <div className="mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-2xl">
        <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">
          Drawing...
        </p>

        {isWheelMode ? (
          <WheelPickerDrawAnimation
            entrants={entrants}
            winner={winner}
            isActive={isVisible}
            onDisplayChange={onDisplayChange}
            onComplete={onComplete}
          />
        ) : (
          <p
            className={`mb-2 font-semibold text-primary ${
              mode === "classic" ? "text-5xl" : "text-4xl animate-pulse"
            }`}
          >
            {displayName || "..."}
          </p>
        )}

        {!isWheelMode ? (
          <DrawAnimation
            mode={mode}
            entrants={entrants}
            winner={winner}
            isActive={isVisible}
            onDisplayChange={onDisplayChange}
            onComplete={onComplete}
          />
        ) : (
          <p
            className="mt-4 text-2xl font-semibold text-primary"
            aria-live="polite"
          >
            {displayName || "..."}
          </p>
        )}
      </div>
    </div>
  );
};
