import type { OverlayLayoutSettings } from "@/overlay/overlayLayout.types";

export type OverlaySettingsSidebarProps = {
  layout: OverlayLayoutSettings;
  onUpdateLayout: (partial: Partial<OverlayLayoutSettings>) => void;
};

export type OverlaySettingsSidebarContextValue = {
  settings: OverlaySettingsSidebarProps | null;
  setSettings: (settings: OverlaySettingsSidebarProps | null) => void;
};
