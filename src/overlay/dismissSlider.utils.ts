import { MAX_RESULT_DISMISS_SECONDS } from "@/overlay/overlayLayout.constants";

export const DISMISS_SLIDER_STOPS = [0, 10, 30, 60] as const;

export type DismissSliderStop = (typeof DISMISS_SLIDER_STOPS)[number];

export const snapDismissSeconds = (raw: number): DismissSliderStop => {
  return DISMISS_SLIDER_STOPS.reduce((closest, stop) =>
    Math.abs(stop - raw) < Math.abs(closest - raw) ? stop : closest,
  );
};

export const getDismissStopPosition = (stop: DismissSliderStop): number =>
  (stop / MAX_RESULT_DISMISS_SECONDS) * 100;
