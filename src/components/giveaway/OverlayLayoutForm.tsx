import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  MAX_RESULT_DISMISS_SECONDS,
  MIN_RESULT_DISMISS_SECONDS,
  OVERLAY_ANCHOR_SELECT_ITEMS,
} from "@/overlay/overlayLayout.constants";
import type {
  OverlayAnchor,
  OverlayLayoutSettings,
} from "@/overlay/overlayLayout.types";

export interface OverlayLayoutFormProps {
  layout: OverlayLayoutSettings;
  onUpdateLayout: (partial: Partial<OverlayLayoutSettings>) => void;
}

const POSITION_FIELDS: ReadonlyArray<{
  key: keyof Pick<
    OverlayLayoutSettings,
    | "wheelPosition"
    | "confirmationPosition"
    | "winnerPosition"
    | "noShowPosition"
    | "participantsPosition"
  >;
  label: string;
  selectId: string;
}> = [
  { key: "wheelPosition", label: "Wheel", selectId: "overlay-wheel-position" },
  {
    key: "confirmationPosition",
    label: "Confirmation",
    selectId: "overlay-confirmation-position",
  },
  {
    key: "winnerPosition",
    label: "Winner",
    selectId: "overlay-winner-position",
  },
  {
    key: "noShowPosition",
    label: "No show",
    selectId: "overlay-noshow-position",
  },
  {
    key: "participantsPosition",
    label: "Participants",
    selectId: "overlay-participants-position",
  },
];

export const OverlayLayoutForm = ({
  layout,
  onUpdateLayout,
}: OverlayLayoutFormProps) => {
  const handlePositionChange =
    (key: (typeof POSITION_FIELDS)[number]["key"]) =>
    (value: string | null): void => {
      if (!value) {
        return;
      }

      onUpdateLayout({ [key]: value as OverlayAnchor });
    };

  const handleDismissChange = (value: number | readonly number[]): void => {
    const raw = Array.isArray(value) ? value[0] : value;
    if (typeof raw !== "number" || Number.isNaN(raw)) {
      return;
    }

    onUpdateLayout({
      resultDismissSeconds: Math.min(
        MAX_RESULT_DISMISS_SECONDS,
        Math.max(MIN_RESULT_DISMISS_SECONDS, Math.round(raw)),
      ),
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2">
        {POSITION_FIELDS.map(({ key, label, selectId }) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={selectId}>{label} position</Label>
            <Select
              value={layout[key]}
              onValueChange={handlePositionChange(key)}
              items={OVERLAY_ANCHOR_SELECT_ITEMS}
            >
              <SelectTrigger id={selectId} aria-label={`${label} position`}>
                <SelectValue />
              </SelectTrigger>
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

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="overlay-result-dismiss-slider">
            Hide winner / no show after
          </Label>
          <span
            className="text-sm tabular-nums text-muted-foreground"
            aria-hidden="true"
          >
            {layout.resultDismissSeconds === 0
              ? "Never"
              : `${layout.resultDismissSeconds}s`}
          </span>
        </div>
        <Slider
          id="overlay-result-dismiss-slider"
          min={MIN_RESULT_DISMISS_SECONDS}
          max={MAX_RESULT_DISMISS_SECONDS}
          step={1}
          value={[layout.resultDismissSeconds]}
          onValueChange={handleDismissChange}
          aria-label={
            layout.resultDismissSeconds === 0
              ? "Hide winner and no show after, never"
              : `Hide winner and no show after ${layout.resultDismissSeconds} seconds`
          }
        />
        <p className="text-xs text-muted-foreground">
          0 keeps results visible until the next draw. Fades out smoothly before
          hiding.
        </p>
      </div>
    </div>
  );
};
