"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SettingsPanelProps } from "@/components/giveaway/SettingsPanel";
import type { GiveawaySettingsSidebarContextValue } from "@/components/layout/giveaway-settings-sidebar.types";

const GiveawaySettingsSidebarContext =
  createContext<GiveawaySettingsSidebarContextValue | null>(null);

const areSettingsPanelPropsEqual = (
  previous: SettingsPanelProps,
  next: SettingsPanelProps,
): boolean => {
  return (
    previous.settings === next.settings &&
    previous.giveawayStarted === next.giveawayStarted &&
    previous.connectionStatus === next.connectionStatus &&
    previous.channelModeMessage === next.channelModeMessage &&
    previous.hasStoredParticipantsOrWinners ===
      next.hasStoredParticipantsOrWinners &&
    previous.usernameSuggestions === next.usernameSuggestions &&
    previous.onUpdateSettings === next.onUpdateSettings &&
    previous.onStartGiveaway === next.onStartGiveaway &&
    previous.onResetGiveaway === next.onResetGiveaway
  );
};

type GiveawaySettingsSidebarProviderProps = {
  children: ReactNode;
};

export const GiveawaySettingsSidebarProvider = ({
  children,
}: GiveawaySettingsSidebarProviderProps) => {
  const [settings, setSettingsState] = useState<SettingsPanelProps | null>(
    null,
  );

  const setSettings = useCallback(
    (nextSettings: SettingsPanelProps | null): void => {
      setSettingsState((previous) => {
        if (previous === nextSettings) {
          return previous;
        }

        if (previous === null || nextSettings === null) {
          return nextSettings;
        }

        if (areSettingsPanelPropsEqual(previous, nextSettings)) {
          return previous;
        }

        return nextSettings;
      });
    },
    [],
  );

  const value = useMemo(
    () => ({
      settings,
      setSettings,
    }),
    [settings, setSettings],
  );

  return (
    <GiveawaySettingsSidebarContext.Provider value={value}>
      {children}
    </GiveawaySettingsSidebarContext.Provider>
  );
};

export const useGiveawaySettingsSidebar =
  (): GiveawaySettingsSidebarContextValue => {
    const context = useContext(GiveawaySettingsSidebarContext);

    if (!context) {
      throw new Error(
        "useGiveawaySettingsSidebar must be used within GiveawaySettingsSidebarProvider.",
      );
    }

    return context;
  };
