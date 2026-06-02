import { useEffect, useRef } from "react";
import type { AnimationMode, Entrant } from "@/giveaway/giveaway.types";
import {
  CLASSIC_ANIMATION_INTERVAL_MS,
  ROLL_ANIMATION_INTERVAL_MS,
  ROLL_ANIMATION_MS,
  WHEEL_ANIMATION_MS,
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
  const wheelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isActive || entrants.length === 0) {
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

    if (mode === "wheel") {
      const segmentAngle = 360 / Math.min(entrants.length, 12);
      const spinRotations = 4 + getSecureRandomIndex(4);
      const winnerIndex = entrants.findIndex(
        (entrant) => entrant.username === winner.username,
      );
      const targetIndex = winnerIndex >= 0 ? winnerIndex : 0;
      const finalRotation =
        spinRotations * 360 + (entrants.length - targetIndex) * segmentAngle;

      if (wheelRef.current) {
        wheelRef.current.style.transition = `transform ${WHEEL_ANIMATION_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1)`;
        wheelRef.current.style.transform = `rotate(${finalRotation}deg)`;
      }

      intervalRef.current = setInterval(cycleRandom, 150);

      timeoutRef.current = setTimeout(() => {
        stopTimers();
        onDisplayChange(winner.username);
        onComplete(winner);
      }, WHEEL_ANIMATION_MS);

      return stopTimers;
    }

    const durationMs = mode === "classic" ? ROLL_ANIMATION_MS : ROLL_ANIMATION_MS;
    const intervalMs =
      mode === "classic" ? CLASSIC_ANIMATION_INTERVAL_MS : ROLL_ANIMATION_INTERVAL_MS;

    intervalRef.current = setInterval(cycleRandom, intervalMs);

    timeoutRef.current = setTimeout(() => {
      stopTimers();
      onDisplayChange(winner.username);
      onComplete(winner);
    }, durationMs);

    return stopTimers;
  }, [entrants, isActive, mode, onComplete, onDisplayChange]);

  if (!isActive || mode !== "wheel") {
    return null;
  }

  const visibleEntrants = entrants.slice(0, 12);
  const segmentAngle = 360 / visibleEntrants.length;

  return (
    <div className="relative mx-auto size-48" aria-hidden="true">
      <div
        ref={wheelRef}
        className="size-full rounded-full border-4 border-primary/40 transition-transform"
        style={{ transform: "rotate(0deg)" }}
      >
        {visibleEntrants.map((entrant, index) => (
          <div
            key={entrant.userId}
            className="absolute left-1/2 top-1/2 w-1/2 origin-left text-[10px] font-medium text-foreground"
            style={{
              transform: `rotate(${index * segmentAngle}deg) translateY(-50%)`,
            }}
          >
            <span className="block truncate pl-2">{entrant.username}</span>
          </div>
        ))}
      </div>
      <div className="absolute -top-2 left-1/2 size-0 -translate-x-1/2 border-x-8 border-b-[14px] border-x-transparent border-b-primary" />
    </div>
  );
};
