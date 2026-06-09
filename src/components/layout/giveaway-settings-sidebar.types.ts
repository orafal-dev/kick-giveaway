import type { SettingsPanelProps } from "@/components/giveaway/SettingsPanel";

export type GiveawaySettingsSidebarContextValue = {
  settings: SettingsPanelProps | null;
  setSettings: (settings: SettingsPanelProps | null) => void;
};
