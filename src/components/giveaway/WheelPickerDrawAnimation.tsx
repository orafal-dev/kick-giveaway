import { useCallback, useEffect, useMemo, useRef } from "react";
import { IOSPicker } from "@/components/wheel-picker/IOSPicker";
import { getDrawAnimationTimings } from "@/giveaway/animationTiming";
import type { Entrant } from "@/giveaway/giveaway.types";
import { getSpinLoopCount, getWinnerIndex } from "@/giveaway/wheelPickerSpin";

interface WheelPickerDrawAnimationProps {
  animationDurationSeconds: number;
  entrants: Entrant[];
  winner: Entrant;
  isActive: boolean;
  onDisplayChange: (username: string) => void;
  onComplete: (winner: Entrant) => void;
}

const WHEEL_ITEM_HEIGHT_PX = 50;
const WHEEL_VISIBLE_COUNT = 9;

export const WheelPickerDrawAnimation = ({
  animationDurationSeconds,
  entrants,
  winner,
  isActive,
  onDisplayChange,
  onComplete,
}: WheelPickerDrawAnimationProps) => {
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timings = useMemo(
    () => getDrawAnimationTimings(animationDurationSeconds),
    [animationDurationSeconds],
  );

  useEffect(() => {
    return () => {
      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
        holdTimeoutRef.current = null;
      }
    };
  }, []);

  const winnerIndex = useMemo(
    () => getWinnerIndex(entrants, winner.userId),
    [entrants, winner.userId],
  );

  const loops = useMemo(
    () => (isActive ? getSpinLoopCount() : 6),
    [isActive, winner.userId],
  );

  const handleActiveIndexChange = useCallback(
    (index: number) => {
      const entrant = entrants[index];
      if (entrant) {
        onDisplayChange(entrant.username);
      }
    },
    [entrants, onDisplayChange],
  );

  const handleSettled = useCallback(() => {
    onDisplayChange(winner.username);

    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }

    holdTimeoutRef.current = setTimeout(() => {
      holdTimeoutRef.current = null;
      onComplete(winner);
    }, timings.wheelPostSpinHoldMs);
  }, [onComplete, onDisplayChange, timings.wheelPostSpinHoldMs, winner]);

  if (!isActive || winnerIndex < 0 || entrants.length === 0) {
    return null;
  }

  return (
    <IOSPicker
      items={entrants}
      renderItem={(entrant, active) => (
        <span className={active ? "font-semibold" : "font-normal"}>
          {entrant.username}
        </span>
      )}
      winnerIndex={winnerIndex}
      spinning={isActive}
      visibleCount={WHEEL_VISIBLE_COUNT}
      itemHeight={WHEEL_ITEM_HEIGHT_PX}
      duration={timings.wheelSpinDurationSec}
      loops={loops}
      onActiveIndexChange={handleActiveIndexChange}
      onSettled={handleSettled}
      className="pointer-events-none"
    />
  );
};
