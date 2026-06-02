import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import type { IOSPickerProps, WheelRowProps } from "@/components/wheel-picker/iosPicker.types";
import { wheelSpinEaseOut } from "@/components/wheel-picker/wheelSpinEasing";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

const DEFAULT_VISIBLE = 9;
const DEFAULT_HEIGHT = 50;
const VIRTUAL_OVERSCAN = 6;

export const IOSPicker = <T,>({
  items,
  renderItem,
  visibleCount = DEFAULT_VISIBLE,
  itemHeight = DEFAULT_HEIGHT,
  winnerIndex,
  spinning = false,
  loops = 6,
  duration = 5,
  className,
  onActiveIndexChange,
  onSettled,
}: IOSPickerProps<T>) => {
  const shouldReduceMotion = useReducedMotion();
  const total = items.length;
  const centerIndex = Math.floor(visibleCount / 2);
  const position = useMotionValue(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollRound, setScrollRound] = useState(0);

  const virtualIndexes = useMemo(() => {
    const current = scrollRound;
    const out: number[] = [];

    for (
      let i = current - centerIndex - VIRTUAL_OVERSCAN;
      i <= current + centerIndex + VIRTUAL_OVERSCAN;
      i++
    ) {
      out.push(i);
    }

    return out;
  }, [centerIndex, scrollRound]);

  useEffect(() => {
    const unsub = position.on("change", (value) => {
      const rounded = Math.round(value);
      setScrollRound(rounded);

      if (total === 0) {
        return;
      }

      const idx = ((rounded % total) + total) % total;
      setActiveIndex(idx);
      onActiveIndexChange?.(idx);
    });

    return () => unsub();
  }, [onActiveIndexChange, position, total]);

  useEffect(() => {
    if (!spinning || winnerIndex === undefined || total === 0) {
      return;
    }

    const current = position.get();
    const normalizedCurrent = ((Math.round(current) % total) + total) % total;
    let delta = winnerIndex - normalizedCurrent;

    if (delta < 0) {
      delta += total;
    }

    const target = current + loops * total + delta;

    if (shouldReduceMotion) {
      position.set(target);
      onSettled?.(items[winnerIndex]!, winnerIndex);
      return;
    }

    const controls = animate(position, target, {
      type: "tween",
      duration,
      ease: wheelSpinEaseOut,
    });

    void controls.finished.then(() => {
      onSettled?.(items[winnerIndex]!, winnerIndex);
    });

    return () => controls.stop();
  }, [
    duration,
    items,
    loops,
    onSettled,
    position,
    shouldReduceMotion,
    spinning,
    total,
    winnerIndex,
  ]);

  if (total === 0) {
    return null;
  }

  const viewportHeight = visibleCount * itemHeight;

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-xs select-none overflow-hidden rounded-xl border border-border bg-card shadow-lg",
        className,
      )}
      style={{
        height: viewportHeight,
        perspective: 1400,
        transformStyle: "preserve-3d",
      }}
      aria-hidden="true"
    >
      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          background: `
            linear-gradient(
              to bottom,
              color-mix(in oklch, var(--card) 95%, transparent) 0%,
              color-mix(in oklch, var(--card) 65%, transparent) 15%,
              transparent 35%,
              transparent 65%,
              color-mix(in oklch, var(--card) 65%, transparent) 85%,
              color-mix(in oklch, var(--card) 95%, transparent) 100%
            )
          `,
        }}
      />

      <div
        className="pointer-events-none absolute inset-x-3 z-10 rounded-lg border border-primary/35 bg-primary/8 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
        style={{
          top: centerIndex * itemHeight,
          height: itemHeight,
        }}
      />

      {virtualIndexes.map((virtualIndex) => {
        const wrapped = ((virtualIndex % total) + total) % total;
        const item = items[wrapped]!;

        return (
          <WheelRow
            key={virtualIndex}
            virtualIndex={virtualIndex}
            position={position}
            itemHeight={itemHeight}
            visibleCount={visibleCount}
            active={wrapped === activeIndex}
          >
            {renderItem
              ? renderItem(item, wrapped === activeIndex)
              : String(item)}
          </WheelRow>
        );
      })}
    </div>
  );
};

const WheelRow = ({
  virtualIndex,
  position,
  itemHeight,
  visibleCount,
  active,
  children,
}: WheelRowProps) => {
  const offset = useTransform(position, (scrollPosition) => virtualIndex - scrollPosition);

  const rotateX = useTransform(
    offset,
    [-visibleCount, 0, visibleCount],
    [75, 0, -75],
  );

  const translateZ = useTransform(
    offset,
    [-visibleCount, 0, visibleCount],
    [-120, 0, -120],
  );

  const opacity = useTransform(offset, [-5, -3, 0, 3, 5], [0, 0.25, 1, 0.25, 0]);

  const scale = useTransform(offset, [-5, 0, 5], [0.72, 1, 0.72]);

  const y = useTransform(
    offset,
    (rowOffset) => rowOffset * itemHeight - itemHeight / 2,
  );

  return (
    <motion.div
      className={cn(
        "absolute inset-x-0 top-1/2 flex items-center justify-center px-4 will-change-transform",
        active ? "text-foreground" : "text-muted-foreground",
      )}
      style={{
        height: itemHeight,
        y,
        rotateX,
        translateZ,
        scale,
        opacity,
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
        fontSize: active ? 20 : 18,
        fontWeight: active ? 600 : 400,
      }}
    >
      <div className="max-w-[90%] truncate whitespace-nowrap">{children}</div>
    </motion.div>
  );
};
