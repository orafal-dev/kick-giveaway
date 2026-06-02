import { useCallback, useMemo } from "react";
import { IOSPicker } from "@/components/wheel-picker/IOSPicker";
import { WHEEL_SPIN_DURATION_MS } from "@/giveaway/giveaway.constants";
import type { Entrant } from "@/giveaway/giveaway.types";
import { getSpinLoopCount, getWinnerIndex } from "@/giveaway/wheelPickerSpin";

interface WheelPickerDrawAnimationProps {
  entrants: Entrant[];
  winner: Entrant;
  isActive: boolean;
  onDisplayChange: (username: string) => void;
  onComplete: (winner: Entrant) => void;
}

const WHEEL_ITEM_HEIGHT_PX = 50;
const WHEEL_VISIBLE_COUNT = 9;

export const WheelPickerDrawAnimation = ({
  entrants,
  winner,
  isActive,
  onDisplayChange,
  onComplete,
}: WheelPickerDrawAnimationProps) => {
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
    onComplete(winner);
  }, [onComplete, onDisplayChange, winner]);

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
      duration={WHEEL_SPIN_DURATION_MS / 1000}
      loops={loops}
      onActiveIndexChange={handleActiveIndexChange}
      onSettled={handleSettled}
      className="pointer-events-none"
    />
  );
};
