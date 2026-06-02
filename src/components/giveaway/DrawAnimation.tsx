import { useEffect, useMemo, useRef } from "react";
import {
  getDrawAnimationTimings,
  getRollIntervalMs,
} from "@/giveaway/animationTiming";
import type { AnimationMode, Entrant } from "@/giveaway/giveaway.types";
import { getSecureRandomIndex } from "@/services/drawUtils";

interface DrawAnimationProps {
  mode: AnimationMode;
  animationDurationSeconds: number;
  entrants: Entrant[];
  winner: Entrant;
  isActive: boolean;
  onDisplayChange: (username: string) => void;
  onComplete: (winner: Entrant) => void;
}

export const DrawAnimation = ({
  mode,
  animationDurationSeconds,
  entrants,
  winner,
  isActive,
  onDisplayChange,
  onComplete,
}: DrawAnimationProps) => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timings = useMemo(
    () => getDrawAnimationTimings(animationDurationSeconds),
    [animationDurationSeconds],
  );

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

    const durationMs = timings.rollDurationMs;
    const intervalMs = getRollIntervalMs(mode, timings);

    intervalRef.current = setInterval(cycleRandom, intervalMs);

    timeoutRef.current = setTimeout(() => {
      stopTimers();
      onDisplayChange(winner.username);
      onComplete(winner);
    }, durationMs);

    return stopTimers;
  }, [
    entrants,
    isActive,
    mode,
    onComplete,
    onDisplayChange,
    timings,
    winner.username,
  ]);

  return null;
};
