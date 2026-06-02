import { useEffect, useRef } from "react";
import type { AnimationMode, Entrant } from "@/giveaway/giveaway.types";
import {
  CLASSIC_ANIMATION_INTERVAL_MS,
  ROLL_ANIMATION_INTERVAL_MS,
  ROLL_ANIMATION_MS,
} from "@/giveaway/giveaway.constants";
import { getSecureRandomIndex } from "@/services/drawUtils";

interface DrawAnimationProps {
  mode: AnimationMode;
  entrants: Entrant[];
  winner: Entrant;
  isActive: boolean;
  onDisplayChange: (username: string) => void;
  onComplete: (winner: Entrant) => void;
}

export const DrawAnimation = ({
  mode,
  entrants,
  winner,
  isActive,
  onDisplayChange,
  onComplete,
}: DrawAnimationProps) => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isActive || entrants.length === 0 || mode === "wheel") {
      return;
    }

    const stopTimers = (): void => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const cycleRandom = (): void => {
      const randomEntrant = entrants[getSecureRandomIndex(entrants.length)];
      if (randomEntrant) {
        onDisplayChange(randomEntrant.username);
      }
    };

    stopTimers();
    cycleRandom();

    const durationMs = ROLL_ANIMATION_MS;
    const intervalMs =
      mode === "classic"
        ? CLASSIC_ANIMATION_INTERVAL_MS
        : ROLL_ANIMATION_INTERVAL_MS;

    intervalRef.current = setInterval(cycleRandom, intervalMs);

    timeoutRef.current = setTimeout(() => {
      stopTimers();
      onDisplayChange(winner.username);
      onComplete(winner);
    }, durationMs);

    return stopTimers;
  }, [entrants, isActive, mode, onComplete, onDisplayChange, winner.username]);

  return null;
};
