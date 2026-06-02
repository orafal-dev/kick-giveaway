import type { AnimationMode } from "@/giveaway/giveaway.types";
import {
  CLASSIC_ANIMATION_INTERVAL_MS,
  ROLL_ANIMATION_INTERVAL_MS,
  ROLL_ANIMATION_MS,
  WHEEL_POST_SPIN_HOLD_MS,
} from "@/giveaway/giveaway.constants";

export interface DrawAnimationTimings {
  totalMs: number;
  wheelSpinDurationSec: number;
  wheelPostSpinHoldMs: number;
  rollDurationMs: number;
  classicIntervalMs: number;
  scrambleIntervalMs: number;
}

export const getDrawAnimationTimings = (
  durationSeconds: number,
): DrawAnimationTimings => {
  const totalMs = durationSeconds * 1000;
  const scale = totalMs / ROLL_ANIMATION_MS;
  const holdMs = WHEEL_POST_SPIN_HOLD_MS;
  const spinMs = Math.max(500, totalMs - holdMs);

  return {
    totalMs,
    wheelSpinDurationSec: spinMs / 1000,
    wheelPostSpinHoldMs: holdMs,
    rollDurationMs: totalMs,
    classicIntervalMs: Math.max(
      30,
      Math.round(CLASSIC_ANIMATION_INTERVAL_MS * scale),
    ),
    scrambleIntervalMs: Math.max(
      30,
      Math.round(ROLL_ANIMATION_INTERVAL_MS * scale),
    ),
  };
};

export const getRollIntervalMs = (
  mode: AnimationMode,
  timings: DrawAnimationTimings,
): number =>
  mode === "classic" ? timings.classicIntervalMs : timings.scrambleIntervalMs;
