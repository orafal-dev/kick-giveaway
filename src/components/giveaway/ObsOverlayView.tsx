"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DrawAnimation } from "@/components/giveaway/DrawAnimation";
import { GiveawayConfetti } from "@/components/giveaway/GiveawayConfetti";
import { OverlayAnchorSlot } from "@/components/giveaway/OverlayAnchorSlot";
import { OverlayParticipantsList } from "@/components/giveaway/OverlayParticipantsList";
import { WheelPickerDrawAnimation } from "@/components/giveaway/WheelPickerDrawAnimation";
import type { Entrant } from "@/giveaway/giveaway.types";
import { useOverlayResultDismiss } from "@/hooks/useOverlayResultDismiss";
import { useOverlaySync } from "@/hooks/useOverlaySync";
import { DEFAULT_OVERLAY_LAYOUT } from "@/overlay/overlayLayout.constants";
import type { OverlayLayoutSettings } from "@/overlay/overlayLayout.types";
import type { OverlayDrawSnapshot } from "@/overlay/overlayDrawSnapshot.types";
import { enableOverlayObsKeepAlive } from "@/overlay/overlayKeepAlive";
import { cn } from "@/lib/utils";

interface ObsOverlayViewProps {
  sessionId: string;
  transparent: boolean;
  initialLayout?: OverlayLayoutSettings;
}

const getVisibleName = (
  displayName: string,
  pendingUsername: string | null,
): string => displayName || pendingUsername || "";

export const ObsOverlayView = ({
  sessionId,
  transparent,
  initialLayout = DEFAULT_OVERLAY_LAYOUT,
}: ObsOverlayViewProps) => {
  const state = useOverlaySync(sessionId);
  const layout = useMemo(
    () => ({ ...DEFAULT_OVERLAY_LAYOUT, ...(state?.layout ?? initialLayout) }),
    [initialLayout, state?.layout],
  );

  const [animatedDisplayName, setAnimatedDisplayName] = useState("");
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [drawSnapshot, setDrawSnapshot] = useState<OverlayDrawSnapshot | null>(
    null,
  );
  const [isLocalDrawAnimating, setIsLocalDrawAnimating] = useState(false);
  const wasDrawingRef = useRef(false);
  const drawSessionCounterRef = useRef(0);

  useLayoutEffect(() => {
    enableOverlayObsKeepAlive();
  }, []);

  useEffect(() => {
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
    document.documentElement.classList.toggle(
      "overlay-transparent",
      transparent,
    );
    document.body.classList.toggle("overlay-transparent", transparent);

    return () => {
      document.documentElement.classList.remove("overlay-transparent");
      document.body.classList.remove("overlay-transparent");
    };
  }, [transparent]);

  useEffect(() => {
    if (!state?.isDrawing || !state.drawTarget) {
      wasDrawingRef.current = false;
      return;
    }

    const isNewDraw = !wasDrawingRef.current;
    wasDrawingRef.current = true;

    if (!isNewDraw) {
      return;
    }

    drawSessionCounterRef.current += 1;

    setDrawSnapshot({
      sessionId: drawSessionCounterRef.current,
      drawTarget: state.drawTarget,
      drawPool: [...state.drawPool],
      animationMode: state.animationMode,
      animationDurationSeconds: state.animationDurationSeconds,
    });
    setIsLocalDrawAnimating(true);
    setAnimatedDisplayName("");
  }, [
    state?.animationDurationSeconds,
    state?.animationMode,
    state?.drawPool,
    state?.drawTarget,
    state?.isDrawing,
  ]);

  const syncedDisplayName = state
    ? getVisibleName(
        state.displayName,
        state.pendingWinner?.username ?? null,
      )
    : "";
  const localDisplayName = isLocalDrawAnimating
    ? animatedDisplayName
    : syncedDisplayName;

  const handleAnimationComplete = useCallback((winner: Entrant): void => {
    setAnimatedDisplayName(winner.username);
    setIsLocalDrawAnimating(false);
    setDrawSnapshot(null);
  }, []);

  const isDrawing = isLocalDrawAnimating && drawSnapshot !== null;

  const visibleName = getVisibleName(
    localDisplayName || state?.displayName || "",
    state?.pendingWinner?.username ?? null,
  );

  const showWinnerPanel =
    Boolean(visibleName) &&
    !isDrawing &&
    (state?.giveawayStarted || state?.showConfetti);
  const showAwaitingConfirmation =
    Boolean(state?.pendingWinner) &&
    state?.winnerConfirmationEnabled &&
    state?.isCountdownActive &&
    !isDrawing;
  const isNoShow = state?.latestWinnerNoShow === true;

  const resultResetKey = useMemo(
    () =>
      `${state?.drawCount ?? 0}:${visibleName}:${isNoShow ? "noshow" : "winner"}`,
    [isNoShow, state?.drawCount, visibleName],
  );

  const showWinnerResult = Boolean(
    showWinnerPanel && !showAwaitingConfirmation && !isNoShow,
  );
  const showNoShowResult = Boolean(
    showWinnerPanel && !showAwaitingConfirmation && isNoShow,
  );

  const winnerDismiss = useOverlayResultDismiss(
    showWinnerResult,
    layout.resultDismissSeconds,
    resultResetKey,
  );
  const noShowDismiss = useOverlayResultDismiss(
    showNoShowResult,
    layout.resultDismissSeconds,
    resultResetKey,
  );

  const showConfetti =
    state?.showConfetti === true ||
    (showWinnerResult && !winnerDismiss.dismissed && !isNoShow);

  const showParticipantsList =
    state?.giveawayStarted === true &&
    (state.recentParticipants?.length ?? 0) > 0;

  const hasVisibleContent =
    isDrawing ||
    showAwaitingConfirmation ||
    showConfetti ||
    (showWinnerResult && !winnerDismiss.dismissed) ||
    (showNoShowResult && !noShowDismiss.dismissed) ||
    showParticipantsList;

  const resultFadeClassName = cn(
    "transition-opacity duration-[600ms] ease-out",
  );

  if (!hasVisibleContent) {
    return (
      <>
        <div
          className={cn(
            "min-h-dvh w-full",
            transparent ? "bg-transparent" : "bg-background",
          )}
          aria-hidden="true"
        />
      </>
    );
  }

  return (
    <div
      className={cn(
        "relative min-h-dvh w-full overflow-hidden",
        transparent ? "bg-transparent" : "bg-background",
      )}
    >
      {showConfetti ? (
        <GiveawayConfetti width={windowSize.width} height={windowSize.height} />
      ) : null}

      {isDrawing && drawSnapshot ? (
        <OverlayAnchorSlot position={layout.wheelPosition}>
          {drawSnapshot.animationMode === "wheel" ? (
            <WheelPickerDrawAnimation
              key={`overlay-draw-${drawSnapshot.sessionId}`}
              animationDurationSeconds={drawSnapshot.animationDurationSeconds}
              entrants={drawSnapshot.drawPool}
              winner={drawSnapshot.drawTarget}
              isActive
              onDisplayChange={setAnimatedDisplayName}
              onComplete={handleAnimationComplete}
              className={cn(
                "pointer-events-none",
                transparent && "bg-card/90 backdrop-blur-md",
              )}
            />
          ) : (
            <div
              className={cn(
                "w-full max-w-md rounded-2xl border border-border p-10 text-center shadow-2xl",
                transparent ? "bg-card/90 backdrop-blur-md" : "bg-card",
              )}
            >
              <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">
                Drawing...
              </p>
              <p
                className={cn(
                  "mb-2 font-semibold text-primary",
                  drawSnapshot.animationMode === "classic"
                    ? "text-6xl"
                    : "text-5xl animate-pulse",
                )}
                aria-live="polite"
              >
                {localDisplayName || "..."}
              </p>
              <DrawAnimation
                key={`overlay-draw-${drawSnapshot.sessionId}`}
                mode={drawSnapshot.animationMode}
                animationDurationSeconds={drawSnapshot.animationDurationSeconds}
                entrants={drawSnapshot.drawPool}
                winner={drawSnapshot.drawTarget}
                isActive
                onDisplayChange={setAnimatedDisplayName}
                onComplete={handleAnimationComplete}
              />
            </div>
          )}
        </OverlayAnchorSlot>
      ) : null}

      {showAwaitingConfirmation && visibleName ? (
        <OverlayAnchorSlot position={layout.confirmationPosition}>
          <div
            className={cn(
              "max-w-3xl rounded-2xl border border-amber-500/50 px-10 py-8 text-center shadow-2xl",
              transparent
                ? "bg-black/55 text-white backdrop-blur-sm"
                : "bg-amber-500/10",
            )}
          >
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-amber-300">
              Awaiting confirmation
            </p>
            <p
              className="text-5xl font-bold tracking-tight text-primary md:text-6xl"
              style={
                transparent
                  ? {
                      color: "#fafafa",
                      textShadow: "0 2px 24px rgba(0,0,0,0.85)",
                    }
                  : undefined
              }
            >
              {visibleName}
            </p>
            <p className="mt-4 text-lg text-muted-foreground">
              {state?.countdownSeconds ?? 0}s remaining
            </p>
          </div>
        </OverlayAnchorSlot>
      ) : null}

      {showWinnerResult && !winnerDismiss.dismissed && visibleName ? (
        <OverlayAnchorSlot
          position={layout.winnerPosition}
          className={cn(
            resultFadeClassName,
            winnerDismiss.fading ? "opacity-0" : "opacity-100",
          )}
        >
          <div className="max-w-4xl text-center">
            <p
              className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-muted-foreground"
              style={
                transparent
                  ? { textShadow: "0 1px 12px rgba(0,0,0,0.8)" }
                  : undefined
              }
            >
              Winner
            </p>
            <p
              className="text-6xl font-bold tracking-tight text-primary md:text-7xl"
              style={
                transparent
                  ? {
                      color: "#fafafa",
                      textShadow: "0 4px 32px rgba(0,0,0,0.9)",
                    }
                  : undefined
              }
              aria-live="polite"
            >
              {visibleName}
            </p>
          </div>
        </OverlayAnchorSlot>
      ) : null}

      {showNoShowResult && !noShowDismiss.dismissed && visibleName ? (
        <OverlayAnchorSlot
          position={layout.noShowPosition}
          className={cn(
            resultFadeClassName,
            noShowDismiss.fading ? "opacity-0" : "opacity-100",
          )}
        >
          <div className="max-w-4xl text-center">
            <p
              className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-destructive"
              style={
                transparent
                  ? { textShadow: "0 1px 12px rgba(0,0,0,0.8)" }
                  : undefined
              }
            >
              No show
            </p>
            <p
              className="text-6xl font-bold tracking-tight text-destructive md:text-7xl"
              style={
                transparent
                  ? {
                      color: "#f87171",
                      textShadow: "0 4px 32px rgba(0,0,0,0.9)",
                    }
                  : undefined
              }
              aria-live="polite"
            >
              {visibleName}
            </p>
          </div>
        </OverlayAnchorSlot>
      ) : null}

      {showParticipantsList ? (
        <OverlayAnchorSlot position={layout.participantsPosition}>
          <OverlayParticipantsList
            participants={state?.recentParticipants ?? []}
          />
        </OverlayAnchorSlot>
      ) : null}
    </div>
  );
};
