import type { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import type {
  AnimationMode,
  GiveawaySettings,
} from "@/giveaway/giveaway.types";
import {
  MAX_CONFIRM_SECONDS,
  MAX_MULTIPLIER,
  MAX_WINNERS_COUNT,
  MIN_CONFIRM_SECONDS,
  MIN_MULTIPLIER,
  MIN_WINNERS_COUNT,
} from "@/giveaway/giveaway.constants";

export interface SettingsPanelProps {
  settings: GiveawaySettings;
  giveawayStarted: boolean;
  connectionStatus: "idle" | "connecting" | "connected";
  channelModeMessage: string;
  onUpdateSettings: (partial: Partial<GiveawaySettings>) => void;
  onStartGiveaway: () => void;
  showStartButton?: boolean;
}

const parseNumberInput = (value: string, fallback: number): number => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const SettingsForm = ({
  settings,
  giveawayStarted,
  connectionStatus,
  channelModeMessage,
  onUpdateSettings,
  onStartGiveaway,
  showStartButton = true,
}: SettingsPanelProps) => {
  const handleAnimationChange = (value: string | null): void => {
    if (!value) {
      return;
    }

    onUpdateSettings({ animationMode: value as AnimationMode });
  };

  const animationItems = [
    { label: "Wheel", value: "wheel" },
    { label: "Classic", value: "classic" },
    { label: "Scramble", value: "scramble" },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <SidebarGroup>
        <SidebarGroupContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="keyword-input">Keyword (optional)</Label>
            <SidebarInput
              id="keyword-input"
              value={settings.keyword}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onUpdateSettings({ keyword: event.target.value })
              }
              placeholder="e.g. !giveaway"
              aria-label="Giveaway keyword"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="winners-count-input">Winners</Label>
            <SidebarInput
              id="winners-count-input"
              type="number"
              min={MIN_WINNERS_COUNT}
              max={MAX_WINNERS_COUNT}
              value={settings.winnersCount}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onUpdateSettings({
                  winnersCount: Math.min(
                    MAX_WINNERS_COUNT,
                    Math.max(
                      MIN_WINNERS_COUNT,
                      parseNumberInput(event.target.value, 1),
                    ),
                  ),
                })
              }
              aria-label="Number of winners"
            />
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="sub-duration-input">
              Subscription Duration (months)
            </Label>
            <SidebarInput
              id="sub-duration-input"
              type="number"
              min={0}
              value={settings.subscriptionDurationMonths}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onUpdateSettings({
                  subscriptionDurationMonths: Math.max(
                    0,
                    parseNumberInput(event.target.value, 0),
                  ),
                })
              }
              aria-label="Minimum subscription duration in months"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sub-multiplier-input">Subscriber Multiplier</Label>
            <SidebarInput
              id="sub-multiplier-input"
              type="number"
              min={MIN_MULTIPLIER}
              max={MAX_MULTIPLIER}
              value={settings.subscriberMultiplier}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onUpdateSettings({
                  subscriberMultiplier: Math.min(
                    MAX_MULTIPLIER,
                    Math.max(
                      MIN_MULTIPLIER,
                      parseNumberInput(event.target.value, 1),
                    ),
                  ),
                })
              }
              aria-label="Subscriber entry multiplier"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="follow-duration-input">
              Follow Duration (days)
            </Label>
            <SidebarInput
              id="follow-duration-input"
              type="number"
              min={0}
              value={settings.followDurationDays}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onUpdateSettings({
                  followDurationDays: Math.max(
                    0,
                    parseNumberInput(event.target.value, 0),
                  ),
                })
              }
              aria-label="Minimum follow duration in days"
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-sidebar-border p-3">
            <Label
              htmlFor="subscribers-only-switch"
              className="cursor-pointer text-sm"
            >
              Subscribers only
            </Label>
            <Switch
              id="subscribers-only-switch"
              checked={settings.subscribersOnly}
              onCheckedChange={(checked) =>
                onUpdateSettings({ subscribersOnly: checked === true })
              }
              aria-label="Allow subscribers only"
            />
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupContent className="space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-sidebar-border p-3">
            <Label
              htmlFor="winner-confirmation-switch"
              className="cursor-pointer text-sm"
            >
              Winner confirmation
            </Label>
            <Switch
              id="winner-confirmation-switch"
              checked={settings.winnerConfirmationEnabled}
              onCheckedChange={(checked) =>
                onUpdateSettings({
                  winnerConfirmationEnabled: checked === true,
                })
              }
              aria-label="Require winner confirmation"
            />
          </div>

          {settings.winnerConfirmationEnabled ? (
            <div className="space-y-2">
              <Label htmlFor="confirm-time-input">Confirm Time (s)</Label>
              <SidebarInput
                id="confirm-time-input"
                type="number"
                min={MIN_CONFIRM_SECONDS}
                max={MAX_CONFIRM_SECONDS}
                value={settings.confirmTimeSeconds}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  onUpdateSettings({
                    confirmTimeSeconds: Math.min(
                      MAX_CONFIRM_SECONDS,
                      Math.max(
                        MIN_CONFIRM_SECONDS,
                        parseNumberInput(
                          event.target.value,
                          MIN_CONFIRM_SECONDS,
                        ),
                      ),
                    ),
                  })
                }
                aria-label="Winner confirmation time in seconds"
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="animation-select">Animation</Label>
            <Select
              value={settings.animationMode}
              onValueChange={handleAnimationChange}
              items={animationItems}
            >
              <SelectTrigger aria-label="Draw animation mode" className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectPopup>
                {animationItems.map(({ label, value }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectPopup>
            </Select>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      {channelModeMessage ? (
        <p className="text-xs text-amber-500" role="status">
          {channelModeMessage}
        </p>
      ) : null}

      {showStartButton ? (
        <div className="space-y-2">
          <Button
            type="button"
            className="w-full"
            onClick={onStartGiveaway}
            disabled={connectionStatus === "connecting"}
            aria-label="Start giveaway and connect to chat"
            variant="kick"
            size="2xl"
          >
            {giveawayStarted ? "Giveaway Running" : "Start Giveaway"}
          </Button>
          {!giveawayStarted ? (
            <p className="text-xs text-muted-foreground">
              Press &quot;Start&quot; to connect to the chat.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

/** @deprecated Use SettingsForm inside GiveawaySidebar */
export const SettingsPanel = SettingsForm;
