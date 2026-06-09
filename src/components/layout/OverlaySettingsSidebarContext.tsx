"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  OverlaySettingsSidebarContextValue,
  OverlaySettingsSidebarProps,
} from "@/components/layout/overlay-settings-sidebar.types";

const OverlaySettingsSidebarContext =
  createContext<OverlaySettingsSidebarContextValue | null>(null);

const areOverlaySettingsPropsEqual = (
  previous: OverlaySettingsSidebarProps,
  next: OverlaySettingsSidebarProps,
): boolean => {
  return (
    previous.layout === next.layout &&
    previous.onUpdateLayout === next.onUpdateLayout
  );
};

type OverlaySettingsSidebarProviderProps = {
  children: ReactNode;
};

export const OverlaySettingsSidebarProvider = ({
  children,
}: OverlaySettingsSidebarProviderProps) => {
  const [settings, setSettingsState] =
    useState<OverlaySettingsSidebarProps | null>(null);

  const setSettings = useCallback(
    (nextSettings: OverlaySettingsSidebarProps | null): void => {
      setSettingsState((previous) => {
        if (previous === nextSettings) {
          return previous;
        }

        if (previous === null || nextSettings === null) {
          return nextSettings;
        }

        if (areOverlaySettingsPropsEqual(previous, nextSettings)) {
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
    <OverlaySettingsSidebarContext.Provider value={value}>
      {children}
    </OverlaySettingsSidebarContext.Provider>
  );
};

export const useOverlaySettingsSidebar =
  (): OverlaySettingsSidebarContextValue => {
    const context = useContext(OverlaySettingsSidebarContext);

    if (!context) {
      throw new Error(
        "useOverlaySettingsSidebar must be used within OverlaySettingsSidebarProvider.",
      );
    }

    return context;
  };
