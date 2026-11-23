"use client";
import { useEffect, useRef, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CropIcon, PencilIcon, ArrowClockwiseIcon,
  TrashIcon, CheckIcon, CircleNotchIcon, ArrowCounterClockwiseIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  ASPECT_PRESETS, fitRectForAspect, exportCroppedImage, loadImage,
  type AspectPresetId, type CropRect,
} from "./canvas-utils";
import React from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string | null;
  defaultAspect?: AspectPresetId | null;
  lockedAspect?: boolean;
  onApply: (blob: Blob, filename: string) => Promise<void> | void;
}

type Tab = "crop" | "draw";
const DRAW_COLORS = ["#0d0d11", "#336dff", "#ff3b30", "#ff9500", "#34c759", "#ffffff"];

export const ImageEditorDialog = React.memo(function ImageEditorDialog({
  open, onOpenChange, src, defaultAspect = null, lockedAspect = false, onApply,
}: Props) {
  const [tab, setTab] = useState<Tab>("crop");
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [aspect, setAspect] = useState<AspectPresetId>(defaultAspect ?? "free");
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 1, height: 1 });
  const [zoom, setZoom] = useState(1);
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState(DRAW_COLORS[0]);
  const [size, setSize] = useState(4);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  useEffect(() => {
    if (!open || !src) return;
    setLoading(true);
    setImg(null);
    loadImage(src)
      .then((im) => {
        setImg(im);
        const preset = ASPECT_PRESETS.find((p) => p.id === aspect);
        if (preset?.ratio) {
          setCrop(fitRectForAspect(im.naturalWidth, im.naturalHeight, preset.ratio));
        } else {
          setCrop({ x: 0, y: 0, width: 1, height: 1 });
        }
        setHistory([]);
        setHistoryIdx(-1);
      })
      .catch(() => {
        // Ignore load errors, dialog will just show empty
      })
      .finally(() => setLoading(false));
  }, [open, src, aspect]);

  const handleApply = async () => {
    if (!img) return;
    setApplying(true);
    try {
      const blob = await exportCroppedImage(img, crop);
      const filename = `edited-${Date.now()}.png`;
      await onApply(blob, filename);
      onOpenChange(false);
    } catch (e) {
      console.error(e);
    } finally {
      setApplying(false);
    }
  };

  const preset = ASPECT_PRESETS.find((p) => p.id === aspect);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Редактор изображения</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-2 mb-4 border-b border-(--outline) pb-2">
          <Button
            variant={tab === "crop" ? "filled" : "text"}
            size="small"
            onClick={() => setTab("crop")}
          >
            <CropIcon className="size-4 mr-2" /> Обрезка
          </Button>
          <Button
            variant={tab === "draw" ? "filled" : "text"}
            size="small"
            onClick={() => setTab("draw")}
          >
            <PencilIcon className="size-4 mr-2" /> Рисование
          </Button>
        </div>

        <div className="flex-1 min-h-[300px] bg-(--bg) rounded-lg flex items-center justify-center overflow-hidden relative">
          {loading ? (
            <CircleNotchIcon className="size-8 animate-spin text-(--on-bg-low)" />
          ) : img ? (
            tab === "crop" ? (
              <div className="relative max-w-full max-h-full p-4">
                <img
                  src={img.src}
                  alt="Preview"
                  className="max-w-full max-h-[60vh] object-contain"
                  style={{
                    clipPath: `inset(${crop.y * 100}% ${100 - (crop.x + crop.width) * 100}% ${100 - (crop.y + crop.height) * 100}% ${crop.x * 100}%)`,
                  }}
                />
              </div>
            ) : (
              <canvas
                ref={drawCanvasRef}
                className="max-w-full max-h-[60vh] border border-(--outline) bg-white"
                width={img.naturalWidth}
                height={img.naturalHeight}
                style={{ transform: `scale(${zoom})` }}
              />
            )
          ) : (
            <span className="text-(--on-bg-low)">Изображение не загружено</span>
          )}
        </div>

        {tab === "crop" && !loading && img && (
          <div className="flex flex-wrap gap-2 mt-4">
            {ASPECT_PRESETS.map((p) => (
              <Button
                key={p.id}
                variant={aspect === p.id ? "filled" : "outlined"}
                size="small"
                disabled={lockedAspect && p.id !== defaultAspect}
                onClick={() => {
                  setAspect(p.id);
                  if (p.ratio && img) {
                    setCrop(fitRectForAspect(img.naturalWidth, img.naturalHeight, p.ratio));
                  } else {
                    setCrop({ x: 0, y: 0, width: 1, height: 1 });
                  }
                }}
              >
                {p.label}
              </Button>
            ))}
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="text" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleApply} disabled={applying || loading || !img}>
            {applying ? <CircleNotchIcon className="size-4 animate-spin mr-2" /> : <CheckIcon className="size-4 mr-2" />}
            Применить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
