"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CloudArrowUpIcon, CircleNotchIcon, XIcon, PlayIcon } from "@phosphor-icons/react";
import { $fetch } from "@/utils/fetch";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (url: string, posterUrl?: string) => void;
}

export function VideoEditorDialog({ open, onOpenChange, onApply }: Props) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.includes("video/")) {
      toast.error("Только видеофайлы");
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await $fetch("/api/v1/uploads/media", { method: "POST", body: fd, isToast: false });
      if (!res?.response?.ok) throw new Error(res?.json?.detail || "Upload failed");
      setPreviewUrl(URL.createObjectURL(file));
      onApply(res.json.url, res.json.poster_url);
      onOpenChange(false);
      toast.success("Видео загружено");
    } catch (err: any) {
      toast.error(err.message || "Ошибка загрузки");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Загрузка видео</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {previewUrl ? (
            <video src={previewUrl} controls className="w-full rounded-lg border border-(--outline)" />
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-(--outline) rounded-lg cursor-pointer hover:bg-(--state-hover) transition-colors">
              {uploading ? (
                <CircleNotchIcon className="size-8 animate-spin text-(--on-bg-low)" />
              ) : (
                <>
                  <CloudArrowUpIcon className="size-8 text-(--on-bg-low) mb-2" />
                  <span className="text-sm text-(--on-bg-medium)">Нажмите для выбора MP4/WebM</span>
                </>
              )}
              <input type="file" className="hidden" accept="video/mp4,video/webm" onChange={handleFileChange} disabled={uploading} />
            </label>
          )}
        </div>
        <DialogFooter>
          <Button variant="text" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
