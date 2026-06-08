import type { ChangeEvent } from "react";
import { GiveawayActionButtons } from "@/components/giveaway/GiveawayActionButtons";
import { DeckSelectTrigger } from "@/components/giveaway/DeckSelectTrigger";
import { IgnoredNicksTextarea } from "@/components/giveaway/IgnoredNicksTextarea";
import { SettingsInlineRow } from "@/components/giveaway/SettingsInlineRow";
import { SettingsStackedRow } from "@/components/giveaway/SettingsStackedRow";
import { SettingsSection } from "@/components/giveaway/SettingsSection";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectValue,
} from "@/components/ui/select";
import { SidebarGroup, SidebarGroupContent, SidebarInput } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import type {
  AnimationMode,
  GiveawaySettings,
} from "@/giveaway/giveaway.types";
import {
  ANIMATION_SELECT_ITEMS,
  CONFIRMATION_SELECT_ITEMS,
  DURATION_SELECT_ITEMS,
  MAX_WINNERS_COUNT,
  MIN_WINNERS_COUNT,
  MULTIPLIER_SELECT_ITEMS,
  SUB_DURATION_SELECT_ITEMS,
} from "@/giveaway/giveaway.constants";

export interface SettingsPanelProps {
  settings: GiveawaySettings;
  giveawayStarted: boolean;
  connectionStatus: "idle" | "connecting" | "connected";
  channelModeMessage: string;
  hasStoredParticipantsOrWinners: boolean;
  onUpdateSettings: (partial: Partial<GiveawaySettings>) => void;
  onStartGiveaway: () => void;
  onResetGiveaway: () => void;
  showStartButton?: boolean;
  usernameSuggestions?: string[];
}

const parseNumberInput = (value: string, fallback: number): number => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const deckInputClass =
  "h-9 min-h-9 items-center border-border/70 bg-[#1c1c1f] shadow-none";

export const SettingsForm = ({
  settings,
  giveawayStarted,
  connectionStatus,
  channelModeMessage,
  onUpdateSettings,
  onStartGiveaway,
  onResetGiveaway,
  hasStoredParticipantsOrWinners,
  showStartButton = true,
}: SettingsPanelProps) => {
  const handleAnimationChange = (value: string | null): void => {
    if (!value) {
      return;
    }

    onUpdateSettings({ animationMode: value as AnimationMode });
  };

  const handleConfirmationChange = (value: string | null): void => {
    if (!value) {
      return;
    }

    onUpdateSettings({
      winnerConfirmationEnabled: value === "on",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <SidebarGroup className="p-0">
        <SidebarGroupContent className="flex flex-col gap-7">
          <SettingsSection title="Entry">
            <SettingsStackedRow label="Keyword" htmlFor="keyword-input">
              <SidebarInput
                id="keyword-input"
                className={deckInputClass}
                value={settings.keyword}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  onUpdateSettings({ keyword: event.target.value })
                }
                placeholder="!giveaway"
                aria-label="Giveaway keyword"
              />
            </SettingsStackedRow>

            <SettingsStackedRow
              label="Ignored nicks"
              htmlFor="ignored-nicks-textarea"
              hint="One per line"
            >
              <IgnoredNicksTextarea
                ignoredNicks={settings.ignoredNicks}
                onIgnoredNicksChange={(ignoredNicks) =>
                  onUpdateSettings({ ignoredNicks })
                }
              />
            </SettingsStackedRow>
          </SettingsSection>

          <SettingsSection title="Eligibility">
            <SettingsInlineRow label="Sub duration" htmlFor="sub-duration-select">
              <Select
                value={String(settings.subscriptionDurationMonths)}
                onValueChange={(value) => {
                  if (!value) {
                    return;
                  }

                  onUpdateSettings({
                    subscriptionDurationMonths: parseNumberInput(value, 0),
                  });
                }}
                items={SUB_DURATION_SELECT_ITEMS}
              >
                <DeckSelectTrigger
                  id="sub-duration-select"
                  aria-label="Minimum subscription duration"
                >
                  <SelectValue />
                </DeckSelectTrigger>
                <SelectPopup>
                  {SUB_DURATION_SELECT_ITEMS.map(({ label, value }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            </SettingsInlineRow>

            <SettingsInlineRow
              label="Sub multiplier"
              htmlFor="sub-multiplier-select"
            >
              <Select
                value={String(settings.subscriberMultiplier)}
                onValueChange={(value) => {
                  if (!value) {
                    return;
                  }

                  onUpdateSettings({
                    subscriberMultiplier: parseNumberInput(value, 1),
                  });
                }}
                items={MULTIPLIER_SELECT_ITEMS}
              >
                <DeckSelectTrigger
                  id="sub-multiplier-select"
                  aria-label="Subscriber entry multiplier"
                >
                  <SelectValue />
                </DeckSelectTrigger>
                <SelectPopup>
                  {MULTIPLIER_SELECT_ITEMS.map(({ label, value }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            </SettingsInlineRow>

            <SettingsInlineRow label="Follow days" htmlFor="follow-duration-input">
              <SidebarInput
                id="follow-duration-input"
                className={deckInputClass}
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
            </SettingsInlineRow>

            <SettingsInlineRow label="Subscribers only" htmlFor="subscribers-only-switch">
              <div className="flex justify-end">
                <Switch
                  id="subscribers-only-switch"
                  className="data-checked:bg-kick"
                  checked={settings.subscribersOnly}
                  onCheckedChange={(checked) =>
                    onUpdateSettings({ subscribersOnly: checked === true })
                  }
                  aria-label="Allow subscribers only"
                />
              </div>
            </SettingsInlineRow>
          </SettingsSection>

          <SettingsSection title="Draw">
            <SettingsInlineRow label="Winners count" htmlFor="winners-count-input">
              <SidebarInput
                id="winners-count-input"
                className={deckInputClass}
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
            </SettingsInlineRow>

            <SettingsInlineRow label="Confirmation" htmlFor="confirmation-select">
              <Select
                value={settings.winnerConfirmationEnabled ? "on" : "off"}
                onValueChange={handleConfirmationChange}
                items={CONFIRMATION_SELECT_ITEMS}
              >
                <DeckSelectTrigger
                  id="confirmation-select"
                  aria-label="Winner confirmation mode"
                >
                  <SelectValue />
                </DeckSelectTrigger>
                <SelectPopup>
                  {CONFIRMATION_SELECT_ITEMS.map(({ label, value }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            </SettingsInlineRow>

            <SettingsInlineRow label="Animation" htmlFor="animation-select">
              <Select
                value={settings.animationMode}
                onValueChange={handleAnimationChange}
                items={ANIMATION_SELECT_ITEMS}
              >
                <DeckSelectTrigger
                  id="animation-select"
                  aria-label="Draw animation mode"
                >
                  <SelectValue />
                </DeckSelectTrigger>
                <SelectPopup>
                  {ANIMATION_SELECT_ITEMS.map(({ label, value }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            </SettingsInlineRow>

            <SettingsInlineRow label="Duration" htmlFor="duration-select">
              <Select
                value={String(settings.animationDurationSeconds)}
                onValueChange={(value) => {
                  if (!value) {
                    return;
                  }

                  onUpdateSettings({
                    animationDurationSeconds: parseNumberInput(value, 8),
                  });
                }}
                items={DURATION_SELECT_ITEMS}
              >
                <DeckSelectTrigger
                  id="duration-select"
                  aria-label="Draw animation duration"
                >
                  <SelectValue />
                </DeckSelectTrigger>
                <SelectPopup>
                  {DURATION_SELECT_ITEMS.map(({ label, value }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            </SettingsInlineRow>
          </SettingsSection>
        </SidebarGroupContent>
      </SidebarGroup>

      {channelModeMessage ? (
        <p className="text-xs text-amber-500" role="status">
          {channelModeMessage}
        </p>
      ) : null}

      {showStartButton ? (
        <GiveawayActionButtons
          giveawayStarted={giveawayStarted}
          connectionStatus={connectionStatus}
          hasStoredParticipantsOrWinners={hasStoredParticipantsOrWinners}
          onStartGiveaway={onStartGiveaway}
          onResetGiveaway={onResetGiveaway}
        />
      ) : null}
    </div>
  );
};

/** @deprecated Use SettingsForm inside GiveawaySidebar */
export const SettingsPanel = SettingsForm;
