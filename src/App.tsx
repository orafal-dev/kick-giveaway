"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHotkey } from "@tanstack/react-hotkeys";
import { useTheme } from "next-themes";
import { GiveawayAppShell } from "@/components/giveaway/GiveawayAppShell";
import { ChannelLanding } from "@/components/giveaway/ChannelLanding";
import { GiveawayConfetti } from "@/components/giveaway/GiveawayConfetti";
import { ConnectionStatusBar } from "@/components/giveaway/ConnectionStatusBar";
import { DrawingOverlay } from "@/components/giveaway/DrawingOverlay";
import { LiveDrawSection } from "@/components/giveaway/LiveDrawSection";
import { useGiveawaySettingsSidebar } from "@/components/layout/GiveawaySettingsSidebarContext";
import { VersionDisplay } from "@/components/VersionDisplay";
import { Spinner } from "@/components/ui/spinner";
import { useAppSessionId } from "@/hooks/useAppSessionId";
import { useKickGiveaway } from "@/hooks/useKickGiveaway";
import { useOverlayBroadcast } from "@/hooks/useOverlayBroadcast";
import { useOverlayLayout } from "@/hooks/useOverlayLayout";

const isEditableElement = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  const tagName = target.tagName.toLowerCase();
  return tagName === "input" || tagName === "textarea" || tagName === "select";
};

function App() {
  const { sessionId, isReady, error: sessionError } = useAppSessionId();
  const { setSettings: setGiveawaySettings } = useGiveawaySettingsSidebar();
  const giveaway = useKickGiveaway(isReady ? sessionId : "");
  const { layout: overlayLayout } = useOverlayLayout();
  const { finalizeDraw } = giveaway;
  const { resolvedTheme, setTheme } = useTheme();
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const handleToggleTheme = useCallback((): void => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleResize = (): void => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useHotkey("D", (event) => {
    if (isEditableElement(event.target)) {
      return;
    }

    event.preventDefault();
    handleToggleTheme();
  });

  const handleAnimationComplete = useCallback(
    (winner: Parameters<typeof finalizeDraw>[0]) => {
      finalizeDraw(winner);
    },
    [finalizeDraw],
  );

  const overlaySessionId = useOverlayBroadcast({
    sessionId: isReady ? sessionId : "",
    channelName: giveaway.channelName,
    giveawayStarted: giveaway.giveawayStarted,
    settings: giveaway.settings,
    isDrawing: giveaway.isDrawing,
    drawTarget: giveaway.drawTarget,
    drawPool: giveaway.drawPool,
    displayName: giveaway.displayName,
    pendingWinner: giveaway.pendingWinner,
    countdownSeconds: giveaway.countdownSeconds,
    isCountdownActive: giveaway.isCountdownActive,
    showConfetti: giveaway.showConfetti,
    drawCount: giveaway.drawCount,
    winners: giveaway.winners,
    entrants: giveaway.entrants,
    layout: overlayLayout,
  });

  const usernameSuggestions = useMemo(() => {
    const names = new Set<string>();

    for (const message of giveaway.lastMessages) {
      const trimmed = message.username.trim();
      if (trimmed) {
        names.add(trimmed);
      }
    }

    for (const entrant of giveaway.entrants) {
      const trimmed = entrant.username.trim();
      if (trimmed) {
        names.add(trimmed);
      }
    }

    return [...names].sort((left, right) =>
      left.localeCompare(right, undefined, { sensitivity: "base" }),
    );
  }, [giveaway.lastMessages, giveaway.entrants]);

  const settingsSidebarProps = useMemo(
    () => ({
      settings: giveaway.settings,
      giveawayStarted: giveaway.giveawayStarted,
      connectionStatus: giveaway.connectionStatus,
      channelModeMessage: giveaway.channelModeMessage,
      hasStoredParticipantsOrWinners:
        giveaway.entrants.length > 0 || giveaway.winners.length > 0,
      onUpdateSettings: giveaway.updateSettings,
      onStartGiveaway: giveaway.handleStartGiveaway,
      onResetGiveaway: giveaway.handleReset,
      usernameSuggestions,
    }),
    [
      giveaway.settings,
      giveaway.giveawayStarted,
      giveaway.connectionStatus,
      giveaway.channelModeMessage,
      giveaway.entrants.length,
      giveaway.winners.length,
      giveaway.updateSettings,
      giveaway.handleStartGiveaway,
      giveaway.handleReset,
      usernameSuggestions,
    ],
  );

  const settingsSidebarPropsRef = useRef(settingsSidebarProps);
  settingsSidebarPropsRef.current = settingsSidebarProps;

  const settingsSidebarSnapshot = useMemo(() => {
    if (!giveaway.isChannelStepComplete) {
      return null;
    }

    return JSON.stringify({
      settings: giveaway.settings,
      giveawayStarted: giveaway.giveawayStarted,
      connectionStatus: giveaway.connectionStatus,
      channelModeMessage: giveaway.channelModeMessage,
      hasStoredParticipantsOrWinners:
        giveaway.entrants.length > 0 || giveaway.winners.length > 0,
      usernameSuggestions,
    });
  }, [
    giveaway.isChannelStepComplete,
    giveaway.settings,
    giveaway.giveawayStarted,
    giveaway.connectionStatus,
    giveaway.channelModeMessage,
    giveaway.entrants.length,
    giveaway.winners.length,
    usernameSuggestions,
  ]);

  useEffect(() => {
    if (!giveaway.isPersistenceReady) {
      return;
    }

    if (!giveaway.isChannelStepComplete) {
      setGiveawaySettings(null);
      return;
    }

    setGiveawaySettings(settingsSidebarPropsRef.current);
  }, [
    giveaway.isPersistenceReady,
    giveaway.isChannelStepComplete,
    setGiveawaySettings,
    settingsSidebarSnapshot,
  ]);

  if (!isReady) {
    return (
      <main
        id="main-content"
        className="mx-auto flex min-h-full w-full max-w-xl flex-1 flex-col items-center justify-center gap-3 p-4 md:p-8"
        aria-busy="true"
        aria-live="polite"
      >
        <Spinner className="size-8" aria-hidden="true" />
        <p className="text-muted-foreground text-sm">
          {sessionError ?? "Starting your session…"}
        </p>
      </main>
    );
  }

  if (!giveaway.isPersistenceReady) {
    return <GiveawayAppShell />;
  }

  if (!giveaway.isChannelStepComplete) {
    return (
      <main
        id="main-content"
        className="mx-auto flex min-h-full w-full max-w-xl flex-1 flex-col justify-center p-4 md:p-8"
      >
        {giveaway.showConfetti ? (
          <GiveawayConfetti
            width={windowSize.width}
            height={windowSize.height}
            onComplete={giveaway.handleConfettiComplete}
          />
        ) : null}
        <ChannelLanding
          channelName={giveaway.channelName}
          errorMessage={giveaway.errorMessage}
          isConnecting={giveaway.connectionStatus === "connecting"}
          onChannelNameChange={giveaway.setChannelName}
          onSubmit={giveaway.handleChannelLandingSubmit}
        />
      </main>
    );
  }

  return (
    <>
      {giveaway.showConfetti ? (
        <GiveawayConfetti
          width={windowSize.width}
          height={windowSize.height}
          onComplete={giveaway.handleConfettiComplete}
        />
      ) : null}

      <div
        id="main-content"
        className="flex min-h-0 w-full flex-1 flex-col gap-4 p-4 md:gap-5 md:p-5"
      >
        <ConnectionStatusBar
          channelName={giveaway.channelName}
          connectionStatus={giveaway.connectionStatus}
          giveawayStarted={giveaway.giveawayStarted}
          entrantCount={giveaway.entrants.length}
          overlaySessionId={overlaySessionId}
          overlayLayout={overlayLayout}
          onChangeChannel={giveaway.handleChangeChannel}
          onClearAllData={giveaway.handleClearAllData}
        />

        {giveaway.serverUnavailable ? (
          <p className="text-sm text-destructive" role="alert">
            Server-side giveaway collection is unavailable. Start Redis and the
            collector process, then reload this page.
          </p>
        ) : null}

        {giveaway.errorMessage ? (
          <p className="text-sm text-destructive" role="alert">
            {giveaway.errorMessage}
          </p>
        ) : null}

        <LiveDrawSection
          className="min-h-0 flex-1"
          entrants={giveaway.entrants}
          drawPoolCount={giveaway.drawPool.length}
          giveawayStarted={giveaway.giveawayStarted}
          isDrawing={giveaway.isDrawing}
          winnersTargetReached={giveaway.winnersTargetReached}
          winnersCount={giveaway.settings.winnersCount}
          onDrawWinner={giveaway.handleDrawWinner}
          winners={giveaway.winners}
          displayName={giveaway.displayName}
          pendingWinner={giveaway.pendingWinner}
          pendingWinnerMessages={giveaway.pendingWinnerMessages}
          recentChatMessages={giveaway.lastMessages}
          countdownSeconds={giveaway.countdownSeconds}
          isCountdownActive={giveaway.isCountdownActive}
          winnerConfirmationEnabled={
            giveaway.settings.winnerConfirmationEnabled
          }
          onManualConfirm={giveaway.handleManualConfirm}
        />

        <footer className="shrink-0 pb-2 text-center text-xs text-muted-foreground">
          <p>This app is not affiliated with Kick.com in any way.</p>
          <VersionDisplay />
        </footer>
      </div>

      {giveaway.isDrawing && giveaway.drawTarget ? (
        <DrawingOverlay
          isVisible={giveaway.isDrawing}
          mode={giveaway.settings.animationMode}
          animationDurationSeconds={giveaway.settings.animationDurationSeconds}
          entrants={giveaway.drawPool}
          winner={giveaway.drawTarget}
          displayName={giveaway.displayName}
          onDisplayChange={giveaway.setDisplayName}
          onComplete={handleAnimationComplete}
          key={giveaway.drawTarget.userId}
        />
      ) : null}
    </>
  );
}

export default App;
