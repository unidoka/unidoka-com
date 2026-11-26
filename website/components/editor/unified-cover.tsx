"use client";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CloudArrowUpIcon, CircleNotchIcon, XIcon } from "@phosphor-icons/react";
import { uploadImage, uploadVideo } from "@/utils/api/uploads";
import { ImageCropDialog } from "./image-crop-dialog";
import { VideoCoverDialog, type VideoTrim } from "./video-editor/video-cover-dialog";

interface Props {
  imageUrl: string;
  videoUrl: string;
  onChange: (imageUrl: string, videoUrl: string) => void;
  /** Storage folder for uploaded cover files (e.g. "articles"). */
  folder?: string;
  /** Strict cover frame ratio. Articles use 16/9, solutions use 4/3. */
  aspect?: number;
}

const IMAGE_LIMIT_MB = 20;
const VIDEO_LIMIT_MB = 100;

export const UnifiedCover = React.memo(function UnifiedCover({
  imageUrl,
  videoUrl,
  onChange,
  folder = "misc",
  aspect = 4 / 3,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const activeUrl = videoUrl || imageUrl;
  const isVideo = Boolean(videoUrl);

  const handleFile = async (file: File) => {
    // Some browsers/OSes hand over an empty or generic MIME type for local
    // video files, so fall back to the extension before rejecting the drop.
    const isVideoFile =
      file.type.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(file.name);
    const isImageFile =
      file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif|avif)$/i.test(file.name);
    const limit = isVideoFile ? VIDEO_LIMIT_MB : IMAGE_LIMIT_MB;
    if (file.size > limit * 1024 * 1024) {
      toast.error(`Файл больше ${limit} МБ`);
      return;
    }
    if (isVideoFile) {
      setVideoFile(file);
      setVideoDialogOpen(true);
    } else if (isImageFile) {
      setImageFile(file);
      if (inputRef.current) inputRef.current.value = "";
    } else {
      toast.error("Можно загрузить изображение или видео");
    }
  };

  const handleApplyVideo = async (
    video: File,
    poster: { blob: Blob; filename: string } | null,
    trim: VideoTrim | null,
  ) => {
    setUploading(true);
    setUploadProgress(0);
    try {
      const { url } = await uploadVideo(video, {
        folder,
        start: trim?.start ?? null,
        end: trim?.end ?? null,
        onProgress: setUploadProgress,
      });
      let posterUrl = "";
      if (poster) {
        try {
          posterUrl = await uploadImage(poster.blob, poster.filename, folder);
        } catch {
          toast.error("Видео загружено, но обложку сохранить не удалось");
        }
      }
      onChange(posterUrl, url);
      toast.success(
        trim ? "Видео обрезано и сохранено" : "Видео-обложка обновлена",
      );
    } catch (err: any) {
      toast.error(err?.message || "Ошибка загрузки");
      throw err;
    } finally {
      setUploading(false);
      setUploadProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleApplyImage = async (blob: Blob, filename: string) => {
    setUploading(true);
    try {
      const url = await uploadImage(blob, filename, folder);
      onChange(url, "");
      setImageFile(null);
      toast.success("Обложка обновлена");
    } catch (err: any) {
      toast.error(err?.message || "Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("", "");
  };

  const openPicker = () => {
    if (!uploading) inputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <div
        className="relative w-full"
        style={{ aspectRatio: String(aspect) }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!dragOver) setDragOver(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragOver(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          const file = event.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
      >
        <button
          type="button"
          onClick={openPicker}
          disabled={uploading}
          aria-label={activeUrl ? "Заменить обложку" : "Загрузить обложку"}
          className={[
            "group relative flex h-full w-full items-center justify-center overflow-hidden border bg-(--bg) transition-colors",
            dragOver ? "border-(--primary) bg-(--primary-glass)" : "border-(--outline)",
            activeUrl ? "cursor-pointer" : "cursor-pointer hover:border-(--on-bg-low)/40",
          ].join(" ")}
        >
          {activeUrl ? (
            isVideo ? (
              <video
                src={videoUrl}
                poster={imageUrl}
                autoPlay
                muted
                loop
                playsInline
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt="Cover"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
              />
            )
          ) : (
            <span className="flex flex-col items-center p-6 text-center text-(--on-bg-low)">
              <CloudArrowUpIcon className="mb-2 size-10" />
              <span className="text-body-4">Нажмите, чтобы загрузить</span>
              <span className="mt-1 text-body-5">или перетащите файл сюда</span>
            </span>
          )}

          {dragOver && (
            <span className="absolute inset-0 flex items-center justify-center bg-(--primary-glass) text-body-3 text-(--primary)">
              Отпустите, чтобы загрузить
            </span>
          )}

          {uploading && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <CircleNotchIcon className="size-6 animate-spin text-white" />
            </span>
          )}
        </button>

        {activeUrl && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Удалить обложку"
            className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
          >
            <XIcon className="size-4" />
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outlined"
          onClick={openPicker}
          disabled={uploading}
          className="flex-1"
        >
          {uploading ? (
            <CircleNotchIcon className="mr-2 size-4 animate-spin" />
          ) : (
            <CloudArrowUpIcon className="mr-2 size-4" />
          )}
          {activeUrl ? "Заменить" : "Загрузить"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime,video/x-m4v,.mp4,.webm,.mov,.m4v"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
      </div>

      <ImageCropDialog
        file={imageFile}
        aspect={aspect}
        outputSize={2560}
        filename="cover"
        onCancel={() => setImageFile(null)}
        onComplete={handleApplyImage}
      />
      <VideoCoverDialog
        open={videoDialogOpen}
        file={videoFile}
        aspect={aspect}
        onOpenChange={(next) => {
          setVideoDialogOpen(next);
          if (!next) {
            setVideoFile(null);
            if (inputRef.current) inputRef.current.value = "";
          }
        }}
        onApply={handleApplyVideo}
        progress={uploadProgress}
      />
    </div>
  );
});
