"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  ArrowClockwiseIcon,
  ArrowCounterClockwiseIcon,
  CheckIcon,
  CircleNotchIcon,
  GridFourIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from "@phosphor-icons/react";

interface Props {
  file: File | null;
  aspect?: number;
  outputSize?: number;
  quality?: number;
  onCancel: () => void;
  onComplete: (blob: Blob, filename: string) => void;
}

/**
 * Telegram-style crop dialog.
 *
 * Layout (matches Telegram's avatar editor):
 *   - The full image is visible inside a fixed-height stage.
 *   - A square crop area sits centered on top, marked by corner brackets.
 *   - A circular outline inside the square previews the final avatar.
 *   - Zoom is controlled by slider + scroll wheel + pinch.
 *   - Bottom bar: [Cancel]  [grid] [rotate ⟲] [rotate ⟳] [reset]  [Apply]
 *
 * Rotation-aware rasterisation: the export path re-draws the source
 * image rotated onto an offscreen canvas sized to the rotated bounding
 * box, then extracts `croppedAreaPixels` from *that* canvas. Doing the
 * rotation math inline (as `getCroppedImg` in react-easy-crop's docs)
 * is what keeps the crop aligned with what the user sees on screen.
 */
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 4;
const STAGE_HEIGHT = "min(64vh, 520px)";

export function ImageCropDialog({
  file,
  aspect = 1,
  outputSize = 512,
  quality = 0.92,
  onCancel,
  onComplete,
}: Props) {
  const [imageUrl, setImageUrl] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [area, setArea] = useState<Area | null>(null);
  const [cropSize, setCropSize] = useState(0);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  // Object URLs leak memory if not revoked (Safari caps at ~200/page).
  useEffect(() => {
    if (!file) {
      setImageUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Reset all view state when a new file lands, so the dialog never
  // opens with the previous session's transform.
  useEffect(() => {
    if (!file) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setArea(null);
    setReady(false);
    setCropSize(0);
  }, [file]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setArea(pixels);
  }, []);

  const onCropSizeChange = useCallback((size: { width: number; height: number }) => {
    // The library reports the crop area's CSS pixel size. We use it to
    // size our overlay (circle + corner brackets) so they line up exactly
    // with the draggable crop region.
    setCropSize(size.width);
  }, []);

  const resetView = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const rotate = (delta: number) =>
    setRotation((r) => (((r + delta) % 360) + 360) % 360);

  const handleSave = async () => {
    if (!area || !imageUrl) return;
    setBusy(true);
    try {
      const supportsWebp =
        typeof document !== "undefined" &&
        document
          .createElement("canvas")
          .toDataURL("image/webp")
          .startsWith("data:image/webp");
      const mime = supportsWebp ? "image/webp" : "image/jpeg";
      const ext = supportsWebp ? "webp" : "jpg";
      const blob = await rasterize(
        imageUrl,
        area,
        rotation,
        outputSize,
        mime,
        quality,
      );
      onComplete(blob, `avatar.${ext}`);
    } catch (e) {
      console.error("[crop] rasterize failed", e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={file !== null} onOpenChange={(o) => !o && !busy && onCancel()}>
      <DialogContent
        className="sm:max-w-xl p-0 gap-0 overflow-hidden border-(--outline) bg-(--card)"
        showCloseButton={false}
      >
        {/* ── Stage ────────────────────────────────────────────────── */}
        <div
          className="relative w-full bg-neutral-950"
          style={{ height: STAGE_HEIGHT }}
        >
          {imageUrl && (
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              minZoom={MIN_ZOOM}
              maxZoom={MAX_ZOOM}
              aspect={aspect}
              cropShape="rect"
              showGrid={showGrid}
              // Prevent the image from being panned/zoomed such that a
              // gap appears inside the crop area. Telegram clamps the
              // same way.
              restrictPosition
              zoomWithScroll
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              onCropSizeChange={onCropSizeChange}
              onMediaLoaded={() => setReady(true)}
            />
          )}

          {/*
            Overlay: circular preview + corner brackets, both sized to
            the crop area reported by react-easy-crop. Centered with the
            same transform the library uses, so they overlap exactly.
            `pointer-events-none` - the Cropper must receive all drags.
          */}
          {cropSize > 0 && (
            <div
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ width: cropSize, height: cropSize }}
            >
              {/* Circular avatar preview - only meaningful for 1:1 crops. */}
              {aspect === 1 && (
                <div
                  className={cn(
                    "absolute inset-0 rounded-full",
                    "border-[1.5px] border-white/80",
                    "shadow-[0_0_0_1px_rgba(0,0,0,0.35),inset_0_0_0_1px_rgba(0,0,0,0.15)]",
                  )}
                />
              )}

              {/* Corner brackets - four L-shapes at the crop square's corners. */}
              <span className="absolute top-0 left-0 h-8 w-8 rounded-tl-md border-t-[3px] border-l-[3px] border-white" />
              <span className="absolute top-0 right-0 h-8 w-8 rounded-tr-md border-t-[3px] border-r-[3px] border-white" />
              <span className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-md border-b-[3px] border-l-[3px] border-white" />
              <span className="absolute bottom-0 right-0 h-8 w-8 rounded-br-md border-b-[3px] border-r-[3px] border-white" />
            </div>
          )}
        </div>

        {/* ── Zoom slider ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-5 py-3 border-t border-(--outline)">
          <MagnifyingGlassMinusIcon className="size-4 shrink-0 text-(--on-bg-low)" />
          <Slider
            value={[zoom]}
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            onValueChange={(v) => setZoom(v[0])}
            disabled={!ready}
            aria-label="Масштаб"
            className="flex-1"
          />
          <MagnifyingGlassPlusIcon className="size-4 shrink-0 text-(--on-bg-low)" />
          <span className="w-11 shrink-0 text-right text-body-5 tabular-nums text-(--on-bg-low)">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* ── Bottom bar - Telegram layout ────────────────────────── */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-(--outline) bg-(--card)">
          <Button
            type="button"
            variant="text"
            onClick={onCancel}
            disabled={busy}
            className="px-2"
          >
            Отмена
          </Button>

          <div className="flex items-center gap-0.5">
            <ToolButton
              label="Сетка"
              active={showGrid}
              onClick={() => setShowGrid((g) => !g)}
              disabled={!ready}
            >
              <GridFourIcon className="size-5" weight={showGrid ? "fill" : "regular"} />
            </ToolButton>

            <ToolButton
              label="Повернуть влево"
              onClick={() => rotate(-90)}
              disabled={!ready}
            >
              <ArrowCounterClockwiseIcon className="size-5" />
            </ToolButton>

            <ToolButton
              label="Повернуть вправо"
              onClick={() => rotate(90)}
              disabled={!ready}
            >
              <ArrowClockwiseIcon className="size-5" />
            </ToolButton>

            <ToolButton
              label="Сбросить"
              onClick={resetView}
              disabled={!ready}
            >
              <span className="text-[11px] font-semibold tracking-wider">
                СБРОС
              </span>
            </ToolButton>
          </div>

          <Button
            type="button"
            onClick={handleSave}
            disabled={busy || !area || !ready}
          >
            {busy ? (
              <CircleNotchIcon className="size-4 animate-spin" />
            ) : (
              <CheckIcon className="size-4" weight="bold" />
            )}
            Применить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Tool button (icon with hover ring, matches Telegram's toolbar) ── */

function ToolButton({
  children,
  label,
  active,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-9 min-w-9 items-center justify-center gap-1 rounded-full px-2 transition-colors",
        "text-(--on-bg-high) hover:bg-(--state-hover)",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        active && "bg-(--primary-glass) text-(--primary)",
      )}
    >
      {children}
    </button>
  );
}

/* ── Canvas helpers ─────────────────────────────────────────────────── */

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}

/** Bounding box of `w × h` after rotating by `deg` degrees. */
function rotatedBounds(w: number, h: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return {
    width: Math.abs(Math.cos(rad) * w) + Math.abs(Math.sin(rad) * h),
    height: Math.abs(Math.sin(rad) * w) + Math.abs(Math.cos(rad) * h),
  };
}

/**
 * Rasterise the visible crop region to a square canvas.
 *
 * `area` comes from react-easy-crop's `onCropComplete` and is already in
 * natural image pixels of the *rotated* image, so it must be applied
 * against a canvas that has the rotation baked in. Skipping the rotation
 * step here (as a first draft did) means the crop rectangle lands in the
 * wrong place the moment the user rotates.
 */
async function rasterize(
  src: string,
  area: Area,
  rotation: number,
  size: number,
  mime: string,
  quality: number,
): Promise<Blob> {
  const img = await loadImage(src);

  // 1. Draw the image onto an offscreen canvas, rotated, so that
  //    `area` (which is in rotated space) matches pixel-for-pixel.
  const bounds = rotatedBounds(img.naturalWidth, img.naturalHeight, rotation);
  const rotatedCanvas = document.createElement("canvas");
  rotatedCanvas.width = Math.ceil(bounds.width);
  rotatedCanvas.height = Math.ceil(bounds.height);
  const rctx = rotatedCanvas.getContext("2d");
  if (!rctx) throw new Error("Canvas 2D unavailable");

  rctx.imageSmoothingEnabled = true;
  rctx.imageSmoothingQuality = "high";
  rctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
  rctx.rotate((rotation * Math.PI) / 180);
  rctx.translate(-img.naturalWidth / 2, -img.naturalHeight / 2);
  rctx.drawImage(img, 0, 0);

  // 2. Extract `area` and scale it to the output square.
  const outCanvas = document.createElement("canvas");
  outCanvas.width = size;
  outCanvas.height = size;
  const octx = outCanvas.getContext("2d");
  if (!octx) throw new Error("Canvas 2D unavailable");
  octx.imageSmoothingEnabled = true;
  octx.imageSmoothingQuality = "high";

  // Clamp so a floating-point round-off in react-easy-crop doesn't
  // sample one pixel past the edge and paint a transparent sliver.
  const sx = Math.max(0, Math.min(area.x, rotatedCanvas.width - 1));
  const sy = Math.max(0, Math.min(area.y, rotatedCanvas.height - 1));
  const sw = Math.max(1, Math.min(area.width, rotatedCanvas.width - sx));
  const sh = Math.max(1, Math.min(area.height, rotatedCanvas.height - sy));

  octx.drawImage(rotatedCanvas, sx, sy, sw, sh, 0, 0, size, size);

  return new Promise((resolve, reject) => {
    outCanvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas export failed"))),
      mime,
      quality,
    );
  });
}
