import { InfoIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  MAX_RESULT_DISMISS_SECONDS,
  MIN_RESULT_DISMISS_SECONDS,
} from "@/overlay/overlayLayout.constants";
import {
  DISMISS_SLIDER_STOPS,
  getDismissStopPosition,
  snapDismissSeconds,
} from "@/overlay/dismissSlider.utils";
import { cn } from "@/lib/utils";

export interface DismissSliderCardProps {
  resultDismissSeconds: number;
  onDismissChange: (seconds: number) => void;
  variant?: "card" | "sidebar";
}

export const DismissSliderCard = ({
  resultDismissSeconds,
  onDismissChange,
  variant = "card",
}: DismissSliderCardProps) => {
  const snappedValue = snapDismissSeconds(resultDismissSeconds);

  const handleDismissChange = (value: number | readonly number[]): void => {
    const raw = Array.isArray(value) ? value[0] : value;
    if (typeof raw !== "number" || Number.isNaN(raw)) {
      return;
    }

    onDismissChange(snapDismissSeconds(raw));
  };

  const dismissLabel = snappedValue === 0 ? "Never" : `${snappedValue} sec`;

  const isSidebarVariant = variant === "sidebar";

  return (
    <section
      className={cn(
        isSidebarVariant
          ? "space-y-5"
          : "rounded-xl border border-border/80 bg-card p-5 md:p-6",
      )}
      aria-labelledby="dismiss-slider-heading"
    >
      <header className="mb-5 space-y-1">
        <h2
          id="dismiss-slider-heading"
          className="text-base font-semibold tracking-tight"
        >
          Dismiss slider
        </h2>
        <p className="text-sm text-muted-foreground">
          How long winner and no-show overlays stay visible before hiding.
        </p>
      </header>

      <div
        className={cn(
          "flex flex-col gap-4",
          !isSidebarVariant && "sm:flex-row sm:items-center",
        )}
      >
        <div className="min-w-0 flex-1 space-y-3">
          <Label htmlFor="overlay-result-dismiss-slider" className="sr-only">
            Hide overlay after
          </Label>
          <div className="relative h-4" aria-hidden="true">
            {DISMISS_SLIDER_STOPS.map((stop) => {
              const position = getDismissStopPosition(stop);

              return (
                <span
                  key={stop}
                  className={cn(
                    "absolute top-0 text-xs text-muted-foreground",
                    stop === MIN_RESULT_DISMISS_SECONDS && "left-0",
                    stop === MAX_RESULT_DISMISS_SECONDS &&
                      "right-0 left-auto",
                    stop !== MIN_RESULT_DISMISS_SECONDS &&
                      stop !== MAX_RESULT_DISMISS_SECONDS &&
                      "-translate-x-1/2",
                  )}
                  style={
                    stop !== MIN_RESULT_DISMISS_SECONDS &&
                    stop !== MAX_RESULT_DISMISS_SECONDS
                      ? { left: `${position}%` }
                      : undefined
                  }
                >
                  {stop} sec
                </span>
              );
            })}
          </div>
          <Slider
            id="overlay-result-dismiss-slider"
            className="[&_[data-slot=slider-indicator]]:bg-kick [&_[data-slot=slider-thumb]]:border-kick/40 [&_[data-slot=slider-thumb]]:bg-kick"
            min={MIN_RESULT_DISMISS_SECONDS}
            max={MAX_RESULT_DISMISS_SECONDS}
            step={1}
            value={[snappedValue]}
            onValueChange={handleDismissChange}
            aria-label={
              snappedValue === 0
                ? "Hide overlay after, never"
                : `Hide overlay after ${snappedValue} seconds`
            }
          />
        </div>

        <div
          className="flex h-10 min-w-[5.5rem] shrink-0 items-center justify-center rounded-lg border border-border/80 bg-[#1c1c1f] px-3 text-sm font-medium tabular-nums"
          aria-live="polite"
        >
          {dismissLabel}
        </div>
      </div>

      <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
        <InfoIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <span>
          0 keeps results on screen until the next draw. Higher values fade out
          before hiding.
        </span>
      </p>
    </section>
  );
};
