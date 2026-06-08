import type { ReactNode } from "react";
import { getOverlayAnchorClassName } from "@/overlay/overlayLayout.utils";
import type { OverlayAnchor } from "@/overlay/overlayLayout.types";
import { cn } from "@/lib/utils";

interface OverlayAnchorSlotProps {
  position: OverlayAnchor;
  children: ReactNode;
  className?: string;
}

export const OverlayAnchorSlot = ({
  position,
  children,
  className,
}: OverlayAnchorSlotProps) => (
  <div
    className={cn(
      "pointer-events-none absolute inset-0 flex p-8 md:p-12",
      getOverlayAnchorClassName(position),
    )}
  >
    <div className={cn("pointer-events-none max-w-full", className)}>
      {children}
    </div>
  </div>
);
