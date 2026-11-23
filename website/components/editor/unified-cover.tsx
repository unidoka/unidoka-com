"use client";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CloudArrowUpIcon, CircleNotchIcon, XIcon } from "@phosphor-icons/react";
import { $fetch } from "@/utils/fetch";
import { ImageEditorDialog } from "./image-editor/image-editor-dialog";
import { VideoEditorDialog } from "./video-editor/video-editor-dialog";
import { readFileAsDataURL } from "./image-editor/canvas-utils";

interface Props {
  imageUrl: string;
  videoUrl: string;
  onChange: (imageUrl: string, videoUrl: string) => void;
}

export const UnifiedCover = React.memo(function UnifiedCover({ imageUrl, videoUrl, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [videoEditorOpen, setVideoEditorOpen] = useState(false);
  const [editorSrc, setEditorSrc] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const activeUrl = videoUrl || imageUrl;

  const handleFile = async (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Файл больше 20 МБ");
      return;
    }
    if (file.type.startsWith("video/")) {
      setVideoFile(file);
      setVideoEditorOpen(true);
    } else {
      setUploading(true);
      try {
        const dataUrl = await readFileAsDataURL(file);
        setEditorSrc(dataUrl);
        setEditorOpen(true);
      } catch {
        toast.error("Не удалось открыть изображение");
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    }
  };

  const handleApplyImage = async (blob: Blob, filename: string) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", new File([blob], filename, { type: blob.type }));
      const res = await $fetch("/api/v1/uploads/media", { method: "POST", body: fd, isToast: false });
      if (!res?.response?.ok) throw new Error(res?.json?.detail || "Upload failed");
      onChange(res.json.url, "");
      toast.success("Обложка обновлена");
    } catch (err: any) {
      toast.error(err.message || "Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  };

  const handleApplyVideo = async (url: string, posterUrl?: string) => {
    onChange(posterUrl || "", url);
    toast.success("Видео-обложка обновлена");
    setVideoFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRemove = () => {
    onChange("", "");
  };

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] w-full rounded-2xl border border-(--outline) bg-(--bg) overflow-hidden flex items-center justify-center">
        {activeUrl ? (
          <>
            {videoUrl ? (
              <video
                src={videoUrl}
                poster={imageUrl}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt="Cover"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors disabled:opacity-50"
            >
              <XIcon className="size-4" />
            </button>
          </>
        ) : (
          <div className="text-center text-(--on-bg-low) p-6">
            <CloudArrowUpIcon className="size-10 mx-auto mb-2" />
            <p className="text-body-4">Загрузите изображение или видео</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outlined"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex-1"
        >
          {uploading ? (
            <CircleNotchIcon className="size-4 animate-spin mr-2" />
          ) : (
            <CloudArrowUpIcon className="size-4 mr-2" />
          )}
          {activeUrl ? "Заменить" : "Загрузить"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/mp4,video/webm"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      <ImageEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        src={editorSrc}
        onApply={handleApplyImage}
      />
      <VideoEditorDialog
        open={videoEditorOpen}
        onOpenChange={setVideoEditorOpen}
        onApply={handleApplyVideo}
      />
    </div>
  );
});
