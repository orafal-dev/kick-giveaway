/** Share of spin time used for the fast roll (remainder eases onto the winner). */
const FAST_PHASE_END = 0.32;
/** How far the wheel travels during the fast roll phase. */
const FAST_PHASE_PROGRESS = 0.9;

/**
 * Fast roll then a short smooth deceleration onto the winner.
 * Avoids expo-style easing that crawls for most of the duration.
 */
export const wheelSpinEaseOut = (t: number): number => {
  if (t <= 0) {
    return 0;
  }

  if (t >= 1) {
    return 1;
  }

  if (t < FAST_PHASE_END) {
    return (t / FAST_PHASE_END) * FAST_PHASE_PROGRESS;
  }

  const localT = (t - FAST_PHASE_END) / (1 - FAST_PHASE_END);
  const eased = 1 - (1 - localT) ** 3;

  return FAST_PHASE_PROGRESS + (1 - FAST_PHASE_PROGRESS) * eased;
};
