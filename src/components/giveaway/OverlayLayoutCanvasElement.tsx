"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useRef, type TransitionEvent } from "react";
import {
  OVERLAY_SETTLE_DURATION_MS,
  OVERLAY_SETTLE_EASING,
  type OverlayCanvasElementDefinition,
  type OverlaySettlingState,
} from "@/components/giveaway/overlay-layout-canvas.types";
import { OVERLAY_ANCHOR_PERCENT } from "@/overlay/overlayLayout.anchorPositions";
import type { OverlayAnchor } from "@/overlay/overlayLayout.types";
import { cn } from "@/lib/utils";

export interface OverlayLayoutCanvasElementProps {
  definition: OverlayCanvasElementDefinition;
  anchor: OverlayAnchor;
  isDragging?: boolean;
  isDimmed?: boolean;
  settling?: OverlaySettlingState | null;
  onSettleComplete?: () => void;
}

export const OverlayLayoutCanvasElement = ({
  definition,
  anchor,
  isDragging = false,
  isDimmed = false,
  settling = null,
  onSettleComplete,
}: OverlayLayoutCanvasElementProps) => {
  const isSettling = settling?.key === definition.key;

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: definition.key,
    disabled: isSettling,
  });

  const point = OVERLAY_ANCHOR_PERCENT[anchor];
  const dragTransform = CSS.Translate.toString(transform);

  const fromPoint = isSettling
    ? OVERLAY_ANCHOR_PERCENT[settling.fromAnchor]
    : point;
  const toPoint = isSettling
    ? OVERLAY_ANCHOR_PERCENT[settling.toAnchor]
    : point;
  const isAnimatingSettle = isSettling && settling.phase === "animate";
  const settleCompletedRef = useRef(false);

  useEffect(() => {
    settleCompletedRef.current = false;
  }, [settling?.key, settling?.phase]);

  useEffect(() => {
    if (!isAnimatingSettle) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (settleCompletedRef.current) {
        return;
      }

      settleCompletedRef.current = true;
      onSettleComplete?.();
    }, OVERLAY_SETTLE_DURATION_MS + 40);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isAnimatingSettle, onSettleComplete]);

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>): void => {
    if (!isAnimatingSettle || event.propertyName !== "transform") {
      return;
    }

    if (settleCompletedRef.current) {
      return;
    }

    settleCompletedRef.current = true;
    onSettleComplete?.();
  };

  const positionStyle = isSettling
    ? {
        left: `${isAnimatingSettle ? toPoint.x : fromPoint.x}%`,
        top: `${isAnimatingSettle ? toPoint.y : fromPoint.y}%`,
        transform: isAnimatingSettle
          ? "translate(-50%, -50%)"
          : `translate(-50%, -50%) translate3d(${settling.delta.x}px, ${settling.delta.y}px, 0)`,
        transition: isAnimatingSettle
          ? `left ${OVERLAY_SETTLE_DURATION_MS}ms ${OVERLAY_SETTLE_EASING}, top ${OVERLAY_SETTLE_DURATION_MS}ms ${OVERLAY_SETTLE_EASING}, transform ${OVERLAY_SETTLE_DURATION_MS}ms ${OVERLAY_SETTLE_EASING}`
          : "none",
      }
    : {
        left: `${point.x}%`,
        top: `${point.y}%`,
        transform: dragTransform
          ? `translate(-50%, -50%) ${dragTransform}`
          : "translate(-50%, -50%)",
      };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "absolute z-2 max-w-[28%] touch-none select-none",
        (isDragging || isSettling) && "z-50 will-change-[left,top,transform]",
        isDimmed && "opacity-35 transition-opacity duration-150",
      )}
      style={positionStyle}
      onTransitionEnd={handleTransitionEnd}
      {...listeners}
      {...attributes}
    >
      <button
        type="button"
        className={cn(
          "flex w-full cursor-grab flex-col items-center gap-1 rounded-lg border px-2.5 py-2 text-left shadow-lg",
          definition.accentClassName,
          !isDragging &&
            !isSettling &&
            "transition-[box-shadow,opacity] duration-150 hover:shadow-xl",
          (isDragging || isSettling) && "cursor-grabbing shadow-2xl ring-2 ring-kick/70",
        )}
        aria-label={`${definition.label} position, drag to move`}
        aria-grabbed={isDragging}
        tabIndex={0}
      >
        <span className="w-full truncate text-[10px] font-semibold uppercase tracking-wider opacity-80">
          {definition.shortLabel}
        </span>
        {definition.key === "wheelPosition" ? (
          <span className="flex size-8 items-center justify-center rounded-full border border-current/30 text-xs font-bold">
            ?
          </span>
        ) : null}
        {definition.key === "confirmationPosition" ? (
          <span className="text-[11px] font-medium leading-tight">Awaiting…</span>
        ) : null}
        {definition.key === "winnerPosition" ? (
          <span className="text-sm font-bold leading-none">Winner</span>
        ) : null}
        {definition.key === "noShowPosition" ? (
          <span className="text-sm font-bold leading-none">No show</span>
        ) : null}
        {definition.key === "participantsPosition" ? (
          <ul className="space-y-0.5 text-[10px] font-semibold leading-tight">
            <li>viewer_1</li>
            <li>viewer_2</li>
            <li className="opacity-60">viewer_3</li>
          </ul>
        ) : null}
      </button>
    </div>
  );
};
