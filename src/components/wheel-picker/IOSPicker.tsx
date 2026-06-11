import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const onSettledRef = useRef(onSettled);
  const onActiveIndexChangeRef = useRef(onActiveIndexChange);
  const spinStartedRef = useRef(false);
  const settledRef = useRef(false);
  const spinGenerationRef = useRef(0);
  const lastRoundedRef = useRef(0);
  const lastActiveIndexRef = useRef(0);
  const spinConfigRef = useRef({
    duration,
    loops,
    winnerIndex,
    total,
    items,
    shouldReduceMotion,
  });

  spinConfigRef.current = {
    duration,
    loops,
    winnerIndex,
    total,
    items,
    shouldReduceMotion,
  };

  useEffect(() => {
    onSettledRef.current = onSettled;
  }, [onSettled]);

  useEffect(() => {
    onActiveIndexChangeRef.current = onActiveIndexChange;
  }, [onActiveIndexChange]);

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

      if (rounded !== lastRoundedRef.current) {
        lastRoundedRef.current = rounded;
        setScrollRound(rounded);
      }

      if (total === 0) {
        return;
      }

      const idx = ((rounded % total) + total) % total;

      if (idx === lastActiveIndexRef.current) {
        return;
      }

      lastActiveIndexRef.current = idx;
      setActiveIndex(idx);
      onActiveIndexChangeRef.current?.(idx);
    });

    return () => unsub();
  }, [position, total]);

  useEffect(() => {
    if (!spinning) {
      spinStartedRef.current = false;
      settledRef.current = false;
      spinGenerationRef.current += 1;
      return;
    }

    if (spinStartedRef.current) {
      return;
    }

    const {
      duration: spinDuration,
      loops: spinLoops,
      winnerIndex: spinWinnerIndex,
      total: spinTotal,
      items: spinItems,
      shouldReduceMotion: reduceMotion,
    } = spinConfigRef.current;

    if (spinWinnerIndex === undefined || spinTotal === 0) {
      return;
    }

    spinStartedRef.current = true;
    settledRef.current = false;
    lastRoundedRef.current = 0;
    lastActiveIndexRef.current = 0;

    const settledItem = spinItems[spinWinnerIndex]!;
    const settledIndex = spinWinnerIndex;
    const spinGeneration = spinGenerationRef.current + 1;
    spinGenerationRef.current = spinGeneration;

    position.set(0);
    setScrollRound(0);
    setActiveIndex(0);

    const target = spinLoops * spinTotal + spinWinnerIndex;

    const finishSpin = (): void => {
      if (spinGeneration !== spinGenerationRef.current || settledRef.current) {
        return;
      }

      settledRef.current = true;
      onSettledRef.current?.(settledItem, settledIndex);
    };

    if (reduceMotion) {
      position.set(target);
      finishSpin();
      return;
    }

    const controls = animate(position, target, {
      type: "tween",
      duration: spinDuration,
      ease: wheelSpinEaseOut,
    });

    void controls.finished.then(finishSpin);

    return () => {
      spinGenerationRef.current += 1;
      controls.stop();
    };
  }, [position, spinning]);

  if (total === 0) {
    return null;
  }

  const viewportHeight = visibleCount * itemHeight;

  return (
    <div
      className={cn(
        "relative mx-auto w-80 max-w-full shrink-0 select-none overflow-hidden rounded-xl border border-border bg-card shadow-lg",
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
