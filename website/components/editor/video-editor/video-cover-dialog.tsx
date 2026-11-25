"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CheckIcon,
  CircleNotchIcon,
  PauseIcon,
  PlayIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { ImageEditorDialog } from "../image-editor/image-editor-dialog";

export interface VideoTrim {
  start: number;
  end: number;
}

interface Props {
  open: boolean;
  file: File | null;
  onOpenChange: (open: boolean) => void;
  onApply: (
    video: File,
    poster: { blob: Blob; filename: string } | null,
    trim: VideoTrim | null,
  ) => Promise<void> | void;
  /** 0-100 while the parent uploads, null when idle. */
  progress?: number | null;
}

function formatTime(value: number): string {
  if (!Number.isFinite(value)) return "0:00";
  const total = Math.max(0, Math.floor(value));
  const minutes = Math.floor(total / 60);
  const seconds = String(total % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

/**
 * Cover picker for video uploads: trim the clip, scrub to a frame, crop it
 * like a photo, and use that crop as the poster. The video is cut on the
 * server with a stream copy (no re-encode).
 */
export function VideoCoverDialog({
  open,
  file,
  onOpenChange,
  onApply,
  progress = null,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<"start" | "end" | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [frameSrc, setFrameSrc] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!open || !file) {
      setVideoUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setDuration(0);
    setTime(0);
    setTrimStart(0);
    setTrimEnd(0);
    setPlaying(false);
    setReady(false);
    setFrameSrc(null);
    return () => URL.revokeObjectURL(url);
  }, [open, file]);

  useEffect(() => {
    if (time < trimStart) {
      seek(trimStart);
    } else if (trimEnd > 0 && time > trimEnd) {
      seek(trimEnd);
    }
    // seek is stable enough for this clamp; only trim bounds matter here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimStart, trimEnd]);

  const seek = (value: number) => {
    const video = videoRef.current;
    setTime(value);
    if (!video) return;
    try {
      video.currentTime = value;
    } catch {
      /* metadata not ready yet */
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      if (video.currentTime >= trimEnd - 0.05) video.currentTime = trimStart;
      void video.play();
    } else {
      video.pause();
    }
  };

  const percent = (value: number) =>
    duration > 0 ? Math.min(Math.max((value / duration) * 100, 0), 100) : 0;

  const timeFromPointer = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 0;
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    return ratio * duration;
  };

  const moveHandle = (handle: "start" | "end", value: number) => {
    const minGap = Math.min(0.5, duration / 2 || 0.5);
    if (handle === "start") {
      setTrimStart(Math.min(Math.max(0, value), Math.max(trimEnd - minGap, 0)));
    } else {
      setTrimEnd(
        Math.max(Math.min(duration, value), Math.min(trimStart + minGap, duration)),
      );
    }
  };

  const beginDrag = (handle: "start" | "end", event: React.PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = handle;
    trackRef.current?.setPointerCapture(event.pointerId);
    moveHandle(handle, timeFromPointer(event.clientX));
  };

  const onTrackMove = (event: React.PointerEvent) => {
    if (!dragRef.current) return;
    moveHandle(dragRef.current, timeFromPointer(event.clientX));
  };

  const endDrag = (event: React.PointerEvent) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    try {
      trackRef.current?.releasePointerCapture(event.pointerId);
    } catch {
      /* capture may already be released */
    }
  };

  const captureFrame = () => {
    const video = videoRef.current;
    if (!video) return;
    if (!video.videoWidth || !video.videoHeight) {
      toast.error("Видео ещё загружается — подождите секунду");
      return;
    }
    // Downscale: a 4K JPEG data URL is slow to load back into the cropper
    // and can hit Safari's data-URL limits, which made the crop step fail.
    const maxSide = 1920;
    const scale = Math.min(
      1,
      maxSide / Math.max(video.videoWidth, video.videoHeight),
    );
    const width = Math.max(1, Math.round(video.videoWidth * scale));
    const height = Math.max(1, Math.round(video.videoHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      toast.error("Не удалось получить кадр");
      return;
    }
    try {
      ctx.drawImage(video, 0, 0, width, height);
      setFrameSrc(canvas.toDataURL("image/jpeg", 0.9));
    } catch {
      toast.error("Не удалось получить кадр — выберите другой момент");
    }
  };

  const handleCropApply = async (blob: Blob, filename: string) => {
    if (!file) return;
    const trimmed =
      trimStart > 0.05 || (duration > 0 && trimEnd < duration - 0.05);
    setApplying(true);
    try {
      await onApply(
        file,
        { blob, filename },
        trimmed ? { start: trimStart, end: trimEnd } : null,
      );
      setFrameSrc(null);
      onOpenChange(false);
    } finally {
      setApplying(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[92vh] max-w-2xl flex-col">
          <DialogHeader>
            <DialogTitle>Обложка видео</DialogTitle>
          </DialogHeader>

          <div className="relative flex min-h-[240px] items-center justify-center overflow-hidden bg-(--bg)">
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                muted
                playsInline
                preload="auto"
                className="max-h-[52vh] w-full object-contain"
                onLoadedMetadata={(event) => {
                  const d = event.currentTarget.duration;
                  const safe = Number.isFinite(d) ? d : 0;
                  setDuration(safe);
                  setTrimStart(0);
                  setTrimEnd(safe);
                  setTime(0);
                }}
                onLoadedData={() => setReady(true)}
                onTimeUpdate={(event) => {
                  const current = event.currentTarget.currentTime;
                  if (trimEnd > 0 && current >= trimEnd) {
                    event.currentTarget.pause();
                    seek(trimEnd);
                    return;
                  }
                  setTime(current);
                }}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
              />
            ) : (
              <CircleNotchIcon className="size-6 animate-spin text-(--on-bg-low)" />
            )}

            {videoUrl && !ready && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/30 text-white">
                <CircleNotchIcon className="size-6 animate-spin" />
                <span className="text-body-5">Загрузка видео…</span>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-body-5 text-(--on-bg-low)">
              <span>Обрезка</span>
              <span className="font-mono">
                {formatTime(trimStart)} – {formatTime(trimEnd)}
              </span>
            </div>
            <div
              ref={trackRef}
              onPointerMove={onTrackMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              className="relative h-9 touch-none select-none rounded-md bg-(--bg)"
            >
              <div
                className="absolute inset-y-0 bg-(--primary-glass)"
                style={{
                  left: `${percent(trimStart)}%`,
                  width: `${percent(trimEnd) - percent(trimStart)}%`,
                }}
              />
              <div
                className="absolute inset-y-0 w-px bg-white/70"
                style={{ left: `${percent(time)}%` }}
              />
              <button
                type="button"
                aria-label="Начало обрезки"
                onPointerDown={(event) => beginDrag("start", event)}
                className="absolute top-0 bottom-0 -ml-1.5 w-3 cursor-ew-resize rounded-sm bg-(--primary)"
                style={{ left: `${percent(trimStart)}%` }}
              />
              <button
                type="button"
                aria-label="Конец обрезки"
                onPointerDown={(event) => beginDrag("end", event)}
                className="absolute top-0 bottom-0 -ml-1.5 w-3 cursor-ew-resize rounded-sm bg-(--primary)"
                style={{ left: `${percent(trimEnd)}%` }}
              />
            </div>
            <p className="text-body-5 text-(--on-bg-low)">
              Потяните края, чтобы вырезать фрагмент — в обложку пойдёт только он.
            </p>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <Button
              type="button"
              variant="outlined"
              size="small"
              onClick={togglePlay}
              disabled={!ready}
              aria-label={playing ? "Пауза" : "Воспроизвести"}
            >
              {playing ? (
                <PauseIcon className="size-4" />
              ) : (
                <PlayIcon className="size-4" />
              )}
            </Button>
            <input
              type="range"
              min={trimStart}
              max={trimEnd || 0}
              step={0.05}
              value={Math.min(Math.max(time, trimStart), trimEnd || time)}
              disabled={!ready}
              onChange={(event) => seek(Number(event.target.value))}
              aria-label="Кадр видео"
              className="h-1 flex-1 cursor-pointer accent-(--primary)"
            />
            <span className="w-24 shrink-0 text-right font-mono text-body-5 text-(--on-bg-low)">
              {formatTime(time)} / {formatTime(duration)}
            </span>
          </div>

          <p className="mt-2 text-body-5 text-(--on-bg-low)">
            Остановитесь на нужном кадре и обрежьте его — он станет обложкой.
          </p>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="text"
              onClick={() => onOpenChange(false)}
              disabled={progress !== null}
            >
              Отмена
            </Button>
            <Button
              type="button"
              onClick={captureFrame}
              disabled={!ready || applying}
            >
              {applying ? (
                <CircleNotchIcon className="mr-2 size-4 animate-spin" />
              ) : (
                <CheckIcon className="mr-2 size-4" />
              )}
              Выбрать кадр
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImageEditorDialog
        open={!!frameSrc}
        onOpenChange={(next) => {
          if (!next && progress === null) setFrameSrc(null);
        }}
        src={frameSrc}
        defaultAspect="4:3"
        lockedAspect
        onApply={handleCropApply}
        progress={progress}
        progressLabel="Загрузка видео"
      />
    </>
  );
}
