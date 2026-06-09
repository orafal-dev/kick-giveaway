"use client";

import { OverlayLayoutSettingsContent } from "@/components/giveaway/OverlayLayoutSettingsContent";
import {
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import type { OverlayLayoutSettings } from "@/overlay/overlayLayout.types";

export interface OverlayLayoutDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  layout: OverlayLayoutSettings;
  onUpdateLayout: (partial: Partial<OverlayLayoutSettings>) => void;
}

export const OverlayLayoutDrawer = ({
  open,
  onOpenChange,
  layout,
  onUpdateLayout,
}: OverlayLayoutDrawerProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-xl border-border/80 bg-card">
        <SheetHeader>
          <SheetTitle>OBS overlay layout</SheetTitle>
          <SheetDescription>
            Position draw elements on your OBS browser source and set how long
            results stay visible.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 overflow-y-auto pb-8">
          <OverlayLayoutSettingsContent
            layout={layout}
            onUpdateLayout={onUpdateLayout}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
