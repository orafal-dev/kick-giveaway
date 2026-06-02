import type { MotionValue } from "motion/react";
import type { ReactNode } from "react";

export interface IOSPickerProps<T> {
  items: T[];
  renderItem?: (item: T, active: boolean) => ReactNode;
  visibleCount?: number;
  itemHeight?: number;
  winnerIndex?: number;
  spinning?: boolean;
  loops?: number;
  duration?: number;
  className?: string;
  onActiveIndexChange?: (index: number) => void;
  onSettled?: (item: T, index: number) => void;
}

export interface WheelRowProps {
  virtualIndex: number;
  position: MotionValue<number>;
  itemHeight: number;
  visibleCount: number;
  active: boolean;
  children: ReactNode;
}
