"use client";

import { useEffect, useMemo, useRef } from "react";
import { ObsOverlayActions } from "@/components/giveaway/ObsOverlayActions";
import { OverlayLayoutSettingsContent } from "@/components/giveaway/OverlayLayoutSettingsContent";
import { useOverlaySettingsSidebar } from "@/components/layout/OverlaySettingsSidebarContext";
import { Spinner } from "@/components/ui/spinner";
import { useAppSessionId } from "@/hooks/useAppSessionId";
import { useOverlayLayout } from "@/hooks/useOverlayLayout";

export const OverlayLayoutSettingsView = () => {
  const { sessionId } = useAppSessionId();
  const { layout, updateLayout, isReady } = useOverlayLayout();
  const { setSettings: setOverlaySettings } = useOverlaySettingsSidebar();

  const overlaySidebarProps = useMemo(
    () => ({
      layout,
      onUpdateLayout: updateLayout,
    }),
    [layout, updateLayout],
  );

  const overlaySidebarPropsRef = useRef(overlaySidebarProps);
  overlaySidebarPropsRef.current = overlaySidebarProps;

  const overlaySidebarSnapshot = useMemo(
    () => JSON.stringify(layout),
    [layout],
  );

  useEffect(() => {
    if (!isReady) {
      setOverlaySettings(null);
      return;
    }

    setOverlaySettings(overlaySidebarPropsRef.current);
  }, [isReady, overlaySidebarSnapshot, setOverlaySettings]);

  useEffect(() => {
    return () => {
      setOverlaySettings(null);
    };
  }, [setOverlaySettings]);

  if (!isReady) {
    return (
      <main
        id="main-content"
        className="mx-auto flex min-h-full w-full flex-1 flex-col items-center justify-center gap-3 p-4 md:p-8"
        aria-busy="true"
        aria-label="Loading overlay layout settings"
      >
        <Spinner className="size-8" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Loading layout settings…</p>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      className="flex min-h-0 w-full flex-1 flex-col gap-6 p-4 md:p-5"
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-balance md:text-3xl">
            OBS overlay layout
          </h1>
          <p className="max-w-prose text-sm text-muted-foreground text-pretty">
            Drag elements on the canvas preview, pick a preset, then copy your
            OBS browser source URL.
          </p>
        </div>
        {sessionId ? (
          <ObsOverlayActions sessionId={sessionId} layout={layout} />
        ) : null}
      </header>

      <OverlayLayoutSettingsContent
        layout={layout}
        onUpdateLayout={updateLayout}
      />
    </main>
  );
};
