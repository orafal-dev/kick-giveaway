import type { OverlayAnchor } from "@/overlay/overlayLayout.types";
import { cn } from "@/lib/utils";

const ANCHOR_SQUARE: Record<
  OverlayAnchor,
  { left: string; top: string }
> = {
  "top-left": { left: "16%", top: "20%" },
  "top-center": { left: "50%", top: "20%" },
  "top-right": { left: "84%", top: "20%" },
  "center-left": { left: "16%", top: "50%" },
  center: { left: "50%", top: "50%" },
  "center-right": { left: "84%", top: "50%" },
  "bottom-left": { left: "16%", top: "80%" },
  "bottom-center": { left: "50%", top: "80%" },
  "bottom-right": { left: "84%", top: "80%" },
};

export interface OverlayMonitorPreviewProps {
  anchor: OverlayAnchor;
  selected?: boolean;
  className?: string;
}

export const OverlayMonitorPreview = ({
  anchor,
  selected = false,
  className,
}: OverlayMonitorPreviewProps) => {
  const square = ANCHOR_SQUARE[anchor];

  return (
    <div
      className={cn(
        "relative mx-auto aspect-[5/3] w-full max-w-[140px] overflow-hidden rounded-md bg-[#121214]",
        className,
      )}
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 size-full text-muted-foreground/25"
        viewBox="0 0 100 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="8"
          y="8"
          width="84"
          height="48"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        <rect x="38" y="58" width="24" height="2" rx="1" fill="currentColor" />
      </svg>
      <span
        className={cn(
          "absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-[2px]",
          selected ? "bg-kick shadow-[0_0_10px] shadow-kick/60" : "bg-kick/80",
        )}
        style={{ left: square.left, top: square.top }}
      />
    </div>
  );
};
