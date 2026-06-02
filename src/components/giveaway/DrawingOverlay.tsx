"use client";

import { useEffect, useRef } from "react";
import { DrawAnimation } from "@/components/giveaway/DrawAnimation";
import { WheelPickerDrawAnimation } from "@/components/giveaway/WheelPickerDrawAnimation";
import type { AnimationMode, Entrant } from "@/giveaway/giveaway.types";

interface DrawingOverlayProps {
  isVisible: boolean;
  mode: AnimationMode;
  animationDurationSeconds: number;
  entrants: Entrant[];
  winner: Entrant;
  displayName: string;
  onDisplayChange: (username: string) => void;
  onComplete: (winner: Entrant) => void;
}

export const DrawingOverlay = ({
  isVisible,
  mode,
  animationDurationSeconds,
  entrants,
  winner,
  displayName,
  onDisplayChange,
  onComplete,
}: DrawingOverlayProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (!dialog.open) {
      dialog.showModal();
    }

    const handleCancel = (event: Event) => {
      event.preventDefault();
    };

    dialog.addEventListener("cancel", handleCancel);

    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      if (dialog.open) {
        dialog.close();
      }
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  const isWheelMode = mode === "wheel";

  return (
    <dialog
      ref={dialogRef}
      aria-label="Drawing winner"
      className="fixed inset-0 z-50 m-0 flex h-dvh w-dvw max-h-none max-w-none items-center justify-center border-0 bg-transparent p-0 open:flex backdrop:bg-background/80 backdrop:backdrop-blur-sm"
    >
      {isWheelMode ? (
        <WheelPickerDrawAnimation
          animationDurationSeconds={animationDurationSeconds}
          entrants={entrants}
          winner={winner}
          isActive={isVisible}
          onDisplayChange={onDisplayChange}
          onComplete={onComplete}
        />
      ) : (
        <div className="mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-2xl">
          <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">
            Drawing...
          </p>

          <p
            className={`mb-2 font-semibold text-primary ${
              mode === "classic" ? "text-5xl" : "text-4xl animate-pulse"
            }`}
            aria-live="polite"
          >
            {displayName || "..."}
          </p>

          <DrawAnimation
            mode={mode}
            animationDurationSeconds={animationDurationSeconds}
            entrants={entrants}
            winner={winner}
            isActive={isVisible}
            onDisplayChange={onDisplayChange}
            onComplete={onComplete}
          />
        </div>
      )}
    </dialog>
  );
};
