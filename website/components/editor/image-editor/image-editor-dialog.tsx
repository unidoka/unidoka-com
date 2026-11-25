"use client";

import {
  useEffect, useRef, useState, type PointerEvent as ReactPointerEvent,
} from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  ASPECT_PRESETS, fitRectForAspect, exportCroppedImage, loadImage,
  type AspectPresetId, type CropRect,
} from "./canvas-utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string | null;
  defaultAspect?: AspectPresetId | null;
  lockedAspect?: boolean;
  onApply: (blob: Blob, filename: string) => Promise<void> | void;
  /** 0-100 while the caller is uploading the result, null otherwise. */
  progress?: number | null;
  progressLabel?: string;
}

const MIN_CROP = 0.06;

type DragMode = "move" | "nw" | "ne" | "sw" | "se";

const HANDLES: Array<{ mode: Exclude<DragMode, "move">; className: string }> = [
  { mode: "nw", className: "-top-1.5 -left-1.5 cursor-nwse-resize" },
  { mode: "ne", className: "-top-1.5 -right-1.5 cursor-nesw-resize" },
  { mode: "sw", className: "-bottom-1.5 -left-1.5 cursor-nesw-resize" },
  { mode: "se", className: "-bottom-1.5 -right-1.5 cursor-nwse-resize" },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function ImageEditorDialog({
  open, onOpenChange, src, defaultAspect = null, lockedAspect = false, onApply,
  progress = null, progressLabel = "Загрузка",
}: Props) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [aspect, setAspect] = useState<AspectPresetId>(defaultAspect ?? "free");
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 1, height: 1 });
  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    mode: DragMode;
    startX: number;
    startY: number;
    bounds: DOMRect;
    rect: CropRect;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    setAspect(defaultAspect ?? "free");
  }, [open, defaultAspect]);

  useEffect(() => {
    if (!open || !src) return;
    setLoading(true);
    setImg(null);
    loadImage(src)
      .then((image) => setImg(image))
      .catch(() => {
        /* dialog shows the empty state */
      })
      .finally(() => setLoading(false));
  }, [open, src]);

  useEffect(() => {
    if (!img) return;
    const preset = ASPECT_PRESETS.find((p) => p.id === aspect);
    setCrop(
      preset?.ratio
        ? fitRectForAspect(img.naturalWidth, img.naturalHeight, preset.ratio)
        : { x: 0, y: 0, width: 1, height: 1 },
    );
  }, [aspect, img]);

  const preset = ASPECT_PRESETS.find((p) => p.id === aspect);
  const freeform = !preset?.ratio;

  const beginDrag = (mode: DragMode, event: ReactPointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const bounds = stageRef.current?.getBoundingClientRect();
    if (!bounds) return;
    stageRef.current?.setPointerCapture(event.pointerId);
    dragRef.current = {
      mode,
      startX: event.clientX,
      startY: event.clientY,
      bounds,
      rect: crop,
    };
  };

  const onPointerMove = (event: ReactPointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;

    const dx = (event.clientX - drag.startX) / drag.bounds.width;
    const dy = (event.clientY - drag.startY) / drag.bounds.height;
    const { x, y, width, height } = drag.rect;

    if (drag.mode === "move") {
      setCrop({
        x: clamp(x + dx, 0, 1 - width),
        y: clamp(y + dy, 0, 1 - height),
        width,
        height,
      });
      return;
    }

    let left = x;
    let top = y;
    let right = x + width;
    let bottom = y + height;

    if (drag.mode.includes("w")) left = clamp(x + dx, 0, right - MIN_CROP);
    if (drag.mode.includes("e")) right = clamp(x + width + dx, left + MIN_CROP, 1);
    if (drag.mode.includes("n")) top = clamp(y + dy, 0, bottom - MIN_CROP);
    if (drag.mode.includes("s")) bottom = clamp(y + height + dy, top + MIN_CROP, 1);

    setCrop({
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
    });
  };

  const endDrag = (event: ReactPointerEvent) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    try {
      stageRef.current?.releasePointerCapture(event.pointerId);
    } catch {
      /* capture may already be released */
    }
  };

  const handleApply = async () => {
    if (!img) return;
    setApplying(true);
    try {
      const blob = await exportCroppedImage(img, crop);
      await onApply(blob, `edited-${Date.now()}.png`);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setApplying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] max-w-3xl flex-col">
        <DialogHeader>
          <DialogTitle>Редактор изображения</DialogTitle>
        </DialogHeader>

        <div className="flex min-h-[300px] flex-1 items-center justify-center overflow-hidden rounded-lg bg-(--bg) p-3">
          {loading ? (
            <CircleNotchIcon className="size-8 animate-spin text-(--on-bg-low)" />
          ) : img ? (
            <div
              ref={stageRef}
              className="relative inline-block max-w-full touch-none select-none"
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt=""
                draggable={false}
                className="block max-h-[60vh] max-w-full"
              />
              <div
                className="absolute cursor-move border border-white/90"
                style={{
                  left: `${crop.x * 100}%`,
                  top: `${crop.y * 100}%`,
                  width: `${crop.width * 100}%`,
                  height: `${crop.height * 100}%`,
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
                }}
                onPointerDown={(event) => beginDrag("move", event)}
              >
                <span className="pointer-events-none absolute inset-y-0 left-1/3 border-l border-white/30" />
                <span className="pointer-events-none absolute inset-y-0 left-2/3 border-l border-white/30" />
                <span className="pointer-events-none absolute inset-x-0 top-1/3 border-t border-white/30" />
                <span className="pointer-events-none absolute inset-x-0 top-2/3 border-t border-white/30" />

                {freeform &&
                  HANDLES.map((handle) => (
                    <span
                      key={handle.mode}
                      className={cn(
                        "absolute size-3 rounded-sm border border-black/40 bg-white",
                        handle.className,
                      )}
                      onPointerDown={(event) => beginDrag(handle.mode, event)}
                    />
                  ))}
              </div>
            </div>
          ) : (
            <span className="text-(--on-bg-low)">Изображение не загружено</span>
          )}
        </div>

        {!loading && img && (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              {ASPECT_PRESETS.map((p) => (
                <Button
                  key={p.id}
                  variant={aspect === p.id ? "filled" : "outlined"}
                  size="small"
                  disabled={lockedAspect && p.id !== defaultAspect}
                  onClick={() => setAspect(p.id)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
            <p className="mt-2 text-body-5 text-(--on-bg-low)">
              Перетащите рамку, чтобы выбрать область.
              {freeform ? " Углы меняют размер." : " Смена формата меняет пропорции."}
            </p>
          </>
        )}

        {typeof progress === "number" && (
          <div className="mt-3 space-y-1">
            <div className="h-1 w-full overflow-hidden rounded-full bg-(--bg)">
              <div
                className="h-full bg-(--primary) transition-[width] duration-200"
                style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
              />
            </div>
            <p className="text-body-5 text-(--on-bg-low)">
              {progressLabel}… {Math.round(progress)}%
            </p>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="text" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleApply} disabled={applying || loading || !img}>
            {applying ? (
              <CircleNotchIcon className="mr-2 size-4 animate-spin" />
            ) : (
              <CheckIcon className="mr-2 size-4" />
            )}
            Применить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
