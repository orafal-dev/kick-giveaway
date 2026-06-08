import type { KeyboardEvent } from "react";
import { OverlayMonitorPreview } from "@/components/giveaway/OverlayMonitorPreview";
import type { OverlayAnchor } from "@/overlay/overlayLayout.types";
import { cn } from "@/lib/utils";

const CORNER_POSITIONS: ReadonlyArray<{
  anchor: OverlayAnchor;
  label: string;
}> = [
  { anchor: "top-left", label: "Top Left" },
  { anchor: "top-right", label: "Top Right" },
  { anchor: "bottom-left", label: "Bottom Left" },
  { anchor: "bottom-right", label: "Bottom Right" },
];

export interface OverlayPositionPickerProps {
  value: OverlayAnchor;
  onChange: (anchor: OverlayAnchor) => void;
  ariaLabel: string;
}

export const OverlayPositionPicker = ({
  value,
  onChange,
  ariaLabel,
}: OverlayPositionPickerProps) => {
  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    anchor: OverlayAnchor,
  ): void => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onChange(anchor);
    }
  };

  return (
    <div role="radiogroup" aria-label={ariaLabel} className="grid grid-cols-2 gap-4">
      {CORNER_POSITIONS.map(({ anchor, label }) => {
        const selected = value === anchor;

        return (
          <button
            key={anchor}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(anchor)}
            onKeyDown={(event) => handleKeyDown(event, anchor)}
            className={cn(
              "flex flex-col items-center gap-3 rounded-xl border p-4 transition-colors",
              "hover:border-kick/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "border-kick/45 bg-[#1c1c1f]"
                : "border-border/80 bg-[#141416]",
            )}
          >
            <OverlayMonitorPreview anchor={anchor} selected={selected} />
            <span className="flex w-full items-center gap-2 text-sm font-medium">
              <span
                className={cn(
                  "size-4 shrink-0 rounded-full border-2",
                  selected
                    ? "border-kick bg-kick"
                    : "border-muted-foreground/40 bg-transparent",
                )}
                aria-hidden="true"
              />
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
