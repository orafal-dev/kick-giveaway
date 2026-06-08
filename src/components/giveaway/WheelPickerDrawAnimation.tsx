import { useCallback, useEffect, useMemo, useRef } from "react";
import { IOSPicker } from "@/components/wheel-picker/IOSPicker";
import { getDrawAnimationTimings } from "@/giveaway/animationTiming";
import type { Entrant } from "@/giveaway/giveaway.types";
import {
  buildWheelBarrel,
  getSpinLoopCountForDuration,
  getWinnerBarrelIndex,
} from "@/giveaway/wheelPickerBarrel";

interface WheelPickerDrawAnimationProps {
  animationDurationSeconds: number;
  entrants: Entrant[];
  winner: Entrant;
  isActive: boolean;
  onDisplayChange: (username: string) => void;
  onComplete: (winner: Entrant) => void;
  className?: string;
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
  className,
}: WheelPickerDrawAnimationProps) => {
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timings = useMemo(
    () => getDrawAnimationTimings(animationDurationSeconds),
    [animationDurationSeconds],
  );

  const barrel = useMemo(() => buildWheelBarrel(entrants), [entrants]);

  const barrelEntrants = useMemo(
    () => barrel.map((slot) => slot.entrant),
    [barrel],
  );

  const winnerBarrelIndex = useMemo(
    () => getWinnerBarrelIndex(barrel, winner.userId),
    [barrel, winner.userId],
  );

  const loops = useMemo(() => {
    if (!isActive) {
      return 6;
    }

    return getSpinLoopCountForDuration(
      barrel.length,
      timings.wheelSpinDurationSec,
    );
  }, [barrel.length, isActive, timings.wheelSpinDurationSec]);

  const clearHoldTimeout = useCallback((): void => {
    const timeoutId = holdTimeoutRef.current;
    holdTimeoutRef.current = null;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      return;
    }

    clearHoldTimeout();
  }, [clearHoldTimeout, isActive]);

  useEffect(() => {
    return clearHoldTimeout;
  }, [clearHoldTimeout]);

  const handleActiveIndexChange = useCallback(
    (barrelIndex: number) => {
      const slot = barrel[barrelIndex];
      if (slot) {
        onDisplayChange(slot.entrant.username);
      }
    },
    [barrel, onDisplayChange],
  );

  const handleSettled = useCallback(() => {
    onDisplayChange(winner.username);
    clearHoldTimeout();
    holdTimeoutRef.current = setTimeout(() => {
      holdTimeoutRef.current = null;
      onComplete(winner);
    }, timings.wheelPostSpinHoldMs);
  }, [
    clearHoldTimeout,
    onComplete,
    onDisplayChange,
    timings.wheelPostSpinHoldMs,
    winner,
  ]);

  if (!isActive || winnerBarrelIndex < 0 || barrel.length === 0) {
    return null;
  }

  return (
    <IOSPicker
      items={barrelEntrants}
      renderItem={(entrant, active) => (
        <span className={active ? "font-semibold" : "font-normal"}>
          {entrant.username}
        </span>
      )}
      winnerIndex={winnerBarrelIndex}
      spinning={isActive}
      visibleCount={WHEEL_VISIBLE_COUNT}
      itemHeight={WHEEL_ITEM_HEIGHT_PX}
      duration={timings.wheelSpinDurationSec}
      loops={loops}
      onActiveIndexChange={handleActiveIndexChange}
      onSettled={handleSettled}
      className={className ?? "pointer-events-none"}
    />
  );
};
