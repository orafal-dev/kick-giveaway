"use client";

import { ChevronDownIcon } from "lucide-react";
import { OverlayPositionPicker } from "@/components/giveaway/OverlayPositionPicker";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DeckSelectTrigger } from "@/components/giveaway/DeckSelectTrigger";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectValue,
} from "@/components/ui/select";
import { OVERLAY_ANCHOR_SELECT_ITEMS } from "@/overlay/overlayLayout.constants";
import type {
  OverlayAnchor,
  OverlayLayoutSettings,
} from "@/overlay/overlayLayout.types";

type OverlayElementKey = keyof Pick<
  OverlayLayoutSettings,
  "wheelPosition" | "confirmationPosition" | "winnerPosition" | "noShowPosition"
>;

const OVERLAY_ELEMENT_FIELDS: ReadonlyArray<{
  key: OverlayElementKey;
  label: string;
}> = [
  { key: "wheelPosition", label: "Wheel" },
  { key: "confirmationPosition", label: "Confirmation" },
  { key: "winnerPosition", label: "Winner" },
  { key: "noShowPosition", label: "No show" },
];

const CORNER_ANCHORS = new Set<OverlayAnchor>([
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
]);

export interface ObsOverlayCardProps {
  layout: OverlayLayoutSettings;
  onUpdateLayout: (partial: Partial<OverlayLayoutSettings>) => void;
}

const getUnifiedPosition = (layout: OverlayLayoutSettings): OverlayAnchor => {
  if (
    layout.wheelPosition === layout.confirmationPosition &&
    layout.wheelPosition === layout.winnerPosition &&
    layout.wheelPosition === layout.noShowPosition &&
    CORNER_ANCHORS.has(layout.wheelPosition)
  ) {
    return layout.wheelPosition;
  }

  return CORNER_ANCHORS.has(layout.wheelPosition)
    ? layout.wheelPosition
    : "bottom-right";
};

export const ObsOverlayCard = ({
  layout,
  onUpdateLayout,
}: ObsOverlayCardProps) => {
  const unifiedPosition = getUnifiedPosition(layout);

  const handleUnifiedChange = (anchor: OverlayAnchor): void => {
    onUpdateLayout({
      wheelPosition: anchor,
      confirmationPosition: anchor,
      winnerPosition: anchor,
      noShowPosition: anchor,
    });
  };

  const handleElementPositionChange =
    (key: OverlayElementKey) => (value: string | null) => {
      if (!value) {
        return;
      }

      onUpdateLayout({ [key]: value as OverlayAnchor });
    };

  return (
    <section
      className="rounded-xl border border-border/80 bg-card p-5 md:p-6"
      aria-labelledby="obs-overlay-heading"
    >
      <header className="mb-6 space-y-1">
        <h2
          id="obs-overlay-heading"
          className="text-base font-semibold tracking-tight"
        >
          OBS overlay
        </h2>
        <p className="text-sm text-muted-foreground">
          Select where the giveaway overlay will appear in your stream.
        </p>
      </header>

      <OverlayPositionPicker
        value={unifiedPosition}
        onChange={handleUnifiedChange}
        ariaLabel="Giveaway overlay screen position"
      />

      <Collapsible className="mt-6">
        <CollapsibleTrigger className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-panel-open:[&_svg]:rotate-180">
          Per-element positions
          <ChevronDownIcon className="size-4" aria-hidden="true" />
        </CollapsibleTrigger>
        <CollapsiblePanel>
          <div className="grid gap-3 pt-4 sm:grid-cols-2">
            {OVERLAY_ELEMENT_FIELDS.map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={`overlay-${key}`}>{label}</Label>
                <Select
                  value={layout[key]}
                  onValueChange={handleElementPositionChange(key)}
                  items={OVERLAY_ANCHOR_SELECT_ITEMS}
                >
                  <DeckSelectTrigger
                    id={`overlay-${key}`}
                    aria-label={`${label} position`}
                  >
                    <SelectValue />
                  </DeckSelectTrigger>
                  <SelectPopup>
                    {OVERLAY_ANCHOR_SELECT_ITEMS.map(
                      ({ label: itemLabel, value }) => (
                        <SelectItem key={value} value={value}>
                          {itemLabel}
                        </SelectItem>
                      ),
                    )}
                  </SelectPopup>
                </Select>
              </div>
            ))}
          </div>
        </CollapsiblePanel>
      </Collapsible>
    </section>
  );
};
