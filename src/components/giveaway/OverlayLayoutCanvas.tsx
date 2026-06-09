"use client";

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  OVERLAY_CANVAS_ELEMENTS,
  OVERLAY_CANVAS_RESOLUTIONS,
  type OverlayCanvasElementKey,
  type OverlayCanvasResolution,
  type OverlaySettlingState,
} from "@/components/giveaway/overlay-layout-canvas.types";
import { OverlayLayoutCanvasElement } from "@/components/giveaway/OverlayLayoutCanvasElement";
import { Button } from "@/components/ui/button";
import {
  OVERLAY_ANCHOR_PERCENT,
  OVERLAY_ANCHORS,
  findNearestOverlayAnchor,
} from "@/overlay/overlayLayout.anchorPositions";
import { OVERLAY_LAYOUT_PRESETS } from "@/overlay/overlayLayout.presets";
import type { OverlayLayoutSettings } from "@/overlay/overlayLayout.types";
import { cn } from "@/lib/utils";

export interface OverlayLayoutCanvasProps {
  layout: OverlayLayoutSettings;
  onUpdateLayout: (partial: Partial<OverlayLayoutSettings>) => void;
}

const getActivePresetId = (
  layout: OverlayLayoutSettings,
): string | null => {
  const match = OVERLAY_LAYOUT_PRESETS.find((preset) =>
    OVERLAY_CANVAS_ELEMENTS.every(
      ({ key }) => layout[key] === preset.positions[key],
    ),
  );

  return match?.id ?? null;
};

export const OverlayLayoutCanvas = ({
  layout,
  onUpdateLayout,
}: OverlayLayoutCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [resolution, setResolution] =
    useState<OverlayCanvasResolution>("1920x1080");
  const [activeId, setActiveId] = useState<OverlayCanvasElementKey | null>(
    null,
  );
  const [hoverAnchor, setHoverAnchor] = useState<
    OverlayLayoutSettings["wheelPosition"] | null
  >(null);
  const [settling, setSettling] = useState<OverlaySettlingState | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const activePresetId = useMemo(() => getActivePresetId(layout), [layout]);
  const resolutionMeta = OVERLAY_CANVAS_RESOLUTIONS.find(
    (item) => item.id === resolution,
  )!;

  const isAnyDragging = activeId !== null;
  const isInteractionLocked = isAnyDragging || settling !== null;

  const beginSettle = useCallback(
    (
      key: OverlayCanvasElementKey,
      fromAnchor: OverlayLayoutSettings["wheelPosition"],
      toAnchor: OverlayLayoutSettings["wheelPosition"],
      delta: { x: number; y: number },
    ): void => {
      setSettling({
        key,
        fromAnchor,
        toAnchor,
        delta,
        phase: "start",
      });

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setSettling((current) =>
            current?.key === key && current.phase === "start"
              ? { ...current, phase: "animate" }
              : current,
          );
        });
      });
    },
    [],
  );

  const handleSettleComplete = useCallback(
    (key: OverlayCanvasElementKey, toAnchor: OverlayLayoutSettings["wheelPosition"]) => {
      setSettling(null);

      if (layout[key] !== toAnchor) {
        onUpdateLayout({ [key]: toAnchor });
      }
    },
    [layout, onUpdateLayout],
  );

  const handleDragStart = useCallback((event: DragStartEvent): void => {
    setSettling(null);
    setActiveId(event.active.id as OverlayCanvasElementKey);
  }, []);

  const resolveDragAnchor = useCallback(
    (key: OverlayCanvasElementKey, deltaX: number, deltaY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return layout[key];
      }

      const rect = canvas.getBoundingClientRect();
      const currentPoint = OVERLAY_ANCHOR_PERCENT[layout[key]];
      const nextX = currentPoint.x + (deltaX / rect.width) * 100;
      const nextY = currentPoint.y + (deltaY / rect.height) * 100;

      return findNearestOverlayAnchor(nextX, nextY);
    },
    [layout],
  );

  const handleDragMove = useCallback(
    (event: DragMoveEvent): void => {
      const key = event.active.id as OverlayCanvasElementKey;
      setHoverAnchor(resolveDragAnchor(key, event.delta.x, event.delta.y));
    },
    [resolveDragAnchor],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent): void => {
      const key = event.active.id as OverlayCanvasElementKey;

      setHoverAnchor(null);
      setActiveId(null);

      if (!event.delta) {
        return;
      }

      const { x, y } = event.delta;
      if (x === 0 && y === 0) {
        return;
      }

      const nearest = resolveDragAnchor(key, x, y);
      beginSettle(key, layout[key], nearest, { x, y });
    },
    [beginSettle, layout, resolveDragAnchor],
  );

  const handleDragCancel = useCallback((): void => {
    setActiveId(null);
    setHoverAnchor(null);
  }, []);

  const handlePresetSelect = useCallback(
    (presetId: string): void => {
      const preset = OVERLAY_LAYOUT_PRESETS.find((item) => item.id === presetId);
      if (!preset) {
        return;
      }

      setSettling(null);
      onUpdateLayout(preset.positions);
    },
    [onUpdateLayout],
  );

  const highlightedAnchor =
    hoverAnchor ?? (settling?.phase === "animate" ? settling.toAnchor : null);

  return (
    <section
      className="rounded-xl border border-border/80 bg-card p-5 md:p-6"
      aria-labelledby="overlay-canvas-heading"
    >
      <header className="mb-5 space-y-1">
        <h2
          id="overlay-canvas-heading"
          className="text-base font-semibold tracking-tight"
        >
          Layout canvas
        </h2>
        <p className="text-sm text-muted-foreground">
          Drag each overlay element on the stream preview. Positions snap to the
          nearest zone and sync to your OBS browser source instantly.
        </p>
      </header>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label="Layout presets"
        >
          {OVERLAY_LAYOUT_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              size="sm"
              variant={activePresetId === preset.id ? "default" : "outline"}
              className={cn(
                "h-8 rounded-full px-3 text-xs",
                activePresetId === preset.id &&
                  "bg-kick text-kick-foreground hover:bg-kick/90",
              )}
              onClick={() => handlePresetSelect(preset.id)}
              aria-pressed={activePresetId === preset.id}
              title={preset.description}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        <div
          className="flex shrink-0 rounded-lg border border-border/80 bg-[#1c1c1f] p-0.5"
          role="group"
          aria-label="Canvas resolution"
        >
          {OVERLAY_CANVAS_RESOLUTIONS.map((item) => (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant="ghost"
              className={cn(
                "h-7 rounded-md px-2.5 text-xs",
                resolution === item.id &&
                  "bg-background text-foreground shadow-sm",
              )}
              onClick={() => setResolution(item.id)}
              aria-pressed={resolution === item.id}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="relative mx-auto w-full max-w-5xl">
          <div
            ref={canvasRef}
            className={cn(
              "relative aspect-video w-full overflow-hidden rounded-lg border border-border/60 bg-[#0a0a0c] shadow-inner",
              isInteractionLocked && "ring-1 ring-kick/30",
            )}
            aria-label={`OBS overlay preview at ${resolutionMeta.width} by ${resolutionMeta.height}`}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
                backgroundSize: "10% 10%",
              }}
              aria-hidden="true"
            />

            {OVERLAY_ANCHORS.map((anchor) => {
              const point = OVERLAY_ANCHOR_PERCENT[anchor];
              const isHighlighted = highlightedAnchor === anchor;

              return (
                <span
                  key={anchor}
                  className={cn(
                    "pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-150",
                    isHighlighted
                      ? "size-4 bg-kick/25 ring-2 ring-kick shadow-[0_0_16px] shadow-kick/50"
                      : isInteractionLocked
                        ? "size-2.5 bg-white/25"
                        : "size-2 bg-white/15",
                  )}
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                  aria-hidden="true"
                />
              );
            })}

            {OVERLAY_CANVAS_ELEMENTS.map((definition) => {
              const isSettlingElement = settling?.key === definition.key;
              const displayAnchor = isSettlingElement
                ? settling.toAnchor
                : layout[definition.key];

              return (
                <OverlayLayoutCanvasElement
                  key={definition.key}
                  definition={definition}
                  anchor={layout[definition.key]}
                  isDragging={activeId === definition.key}
                  isDimmed={
                    isInteractionLocked &&
                    activeId !== definition.key &&
                    !isSettlingElement
                  }
                  settling={isSettlingElement ? settling : null}
                  onSettleComplete={() =>
                    handleSettleComplete(definition.key, displayAnchor)
                  }
                />
              );
            })}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-[10px] text-white/70">
              <span>
                {resolutionMeta.width}×{resolutionMeta.height}
              </span>
              <span>Drag elements to reposition</span>
            </div>
          </div>
        </div>
      </DndContext>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {OVERLAY_CANVAS_ELEMENTS.map((definition) => (
          <li
            key={definition.key}
            className="flex items-center gap-2 rounded-md border border-border/60 bg-[#1c1c1f]/60 px-2.5 py-2 text-xs"
          >
            <span
              className={cn(
                "size-2.5 shrink-0 rounded-full border",
                definition.accentClassName,
              )}
              aria-hidden="true"
            />
            <span className="font-medium text-foreground">
              {definition.label}
            </span>
            <span className="ms-auto text-muted-foreground">
              {(settling?.key === definition.key
                ? settling.toAnchor
                : layout[definition.key]
              ).replace("-", " ")}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};
