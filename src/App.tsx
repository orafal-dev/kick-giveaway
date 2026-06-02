import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { useHotkey } from "@tanstack/react-hotkeys";
import { ChannelLanding } from "@/components/giveaway/ChannelLanding";
import { GiveawayConfetti } from "@/components/giveaway/GiveawayConfetti";
import { ConnectionBar } from "@/components/giveaway/ConnectionBar";
import { DrawingOverlay } from "@/components/giveaway/DrawingOverlay";
import { GiveawaySidebar } from "@/components/giveaway/GiveawaySidebar";
import { ParticipantsPanel } from "@/components/giveaway/ParticipantsPanel";
import { WinnersPanel } from "@/components/giveaway/WinnersPanel";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getInitialTheme, saveTheme } from "@/giveaway/giveawayStorage";
import { useKickGiveaway } from "@/hooks/useKickGiveaway";

type ThemeMode = "dark" | "light";

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
  const giveaway = useKickGiveaway();
  const { finalizeDraw } = giveaway;
  const [themeMode, setThemeMode] = useState<ThemeMode>(() =>
    getInitialTheme(),
  );
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const handleToggleTheme = useCallback((): void => {
    setThemeMode((previousMode) =>
      previousMode === "dark" ? "light" : "dark",
    );
  }, []);

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

  useEffect(() => {
    document.documentElement.classList.toggle("dark", themeMode === "dark");
    saveTheme(themeMode);
  }, [themeMode]);

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

  const settingsSidebarProps = {
    settings: giveaway.settings,
    giveawayStarted: giveaway.giveawayStarted,
    connectionStatus: giveaway.connectionStatus,
    channelModeMessage: giveaway.channelModeMessage,
    onUpdateSettings: giveaway.updateSettings,
    onStartGiveaway: giveaway.handleStartGiveaway,
  };

  if (!giveaway.isChannelStepComplete) {
    return (
      <main className="mx-auto flex min-h-svh w-full max-w-xl flex-col justify-center p-4 md:p-8">
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
    <SidebarProvider
      defaultOpen
      style={
        {
          "--sidebar-width": "24rem",
        } as CSSProperties
      }
    >
      {giveaway.showConfetti ? (
        <GiveawayConfetti
          width={windowSize.width}
          height={windowSize.height}
          onComplete={giveaway.handleConfettiComplete}
        />
      ) : null}

      <GiveawaySidebar {...settingsSidebarProps} />

      <SidebarInset>
        <div className="flex min-h-svh flex-col gap-4 p-4 md:p-6">
          <div className="flex items-start gap-3">
            <SidebarTrigger
              className="mt-0.5 shrink-0"
              aria-label="Toggle settings sidebar"
            />
            <header className="min-w-0 flex-1 space-y-1">
              <h1 className="truncate text-2xl font-bold tracking-tight md:text-3xl">
                kickaway.win
              </h1>
            </header>
          </div>

          <ConnectionBar
            channelName={giveaway.channelName}
            devModeActive={giveaway.devModeEnabled}
            devMockCount={giveaway.devMockEntrantCount}
            onChangeChannel={giveaway.handleChangeChannel}
            onClearAllData={giveaway.handleClearAllData}
          />

          {giveaway.errorMessage ? (
            <p className="text-sm text-destructive" role="alert">
              {giveaway.errorMessage}
            </p>
          ) : null}

          <section className="grid flex-1 gap-4 lg:grid-cols-2">
            <ParticipantsPanel
              entrants={giveaway.entrants}
              drawPoolCount={giveaway.drawPool.length}
              giveawayStarted={giveaway.giveawayStarted}
              isDrawing={giveaway.isDrawing}
              winnersTargetReached={giveaway.winnersTargetReached}
              winnersCount={giveaway.settings.winnersCount}
              onDrawWinner={giveaway.handleDrawWinner}
              onReset={giveaway.handleReset}
            />

            <WinnersPanel
              winners={giveaway.winners}
              displayName={giveaway.displayName}
              isDrawing={giveaway.isDrawing}
              pendingWinner={giveaway.pendingWinner}
              countdownSeconds={giveaway.countdownSeconds}
              isCountdownActive={giveaway.isCountdownActive}
              winnerConfirmationEnabled={
                giveaway.settings.winnerConfirmationEnabled
              }
              onManualConfirm={giveaway.handleManualConfirm}
            />
          </section>

          <footer className="space-y-1 text-center text-xs text-muted-foreground">
            <p>This app is not affiliated with Kick.com in any way.</p>
          </footer>
        </div>
      </SidebarInset>

      {giveaway.isDrawing && giveaway.drawTarget ? (
        <DrawingOverlay
          isVisible={giveaway.isDrawing}
          mode={giveaway.settings.animationMode}
          entrants={giveaway.drawPool}
          winner={giveaway.drawTarget}
          displayName={giveaway.displayName}
          onDisplayChange={giveaway.setDisplayName}
          onComplete={handleAnimationComplete}
          key={giveaway.drawTarget.userId}
        />
      ) : null}
    </SidebarProvider>
  );
}

export default App;
