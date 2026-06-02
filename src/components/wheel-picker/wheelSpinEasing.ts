/**
 * Smooth ease-out: velocity is highest at the start and decreases continuously
 * to zero at the end (no phased segments — avoids a sudden slowdown).
 *
 * Higher power = faster initial roll, longer gentle tail (4–5 works well with the barrel).
 */
const EASE_OUT_POWER = 4.5;

export const wheelSpinEaseOut = (t: number): number => {
  if (t <= 0) {
    return 0;
  }

  if (t >= 1) {
    return 1;
  }

  return 1 - (1 - t) ** EASE_OUT_POWER;
};
