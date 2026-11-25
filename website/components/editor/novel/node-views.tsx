"use client";
import { NodeViewWrapper } from "@tiptap/react";
import { useRef, useState } from "react";
import { Trash, Plus, PencilSimple } from "@phosphor-icons/react";
import { ImageEditorDialog } from "../image-editor/image-editor-dialog";
import {
  readFileAsDataURL,
  type AspectPresetId,
} from "../image-editor/canvas-utils";
import { $fetch } from "@/utils/fetch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const GALLERY_ASPECTS = [
  { value: "1:1", label: "1:1", className: "aspect-square" },
  { value: "4:3", label: "4:3", className: "aspect-[4/3]" },
  { value: "16:9", label: "16:9", className: "aspect-video" },
  { value: "auto", label: "Авто", className: "h-auto" },
] as const;

const ASPECT_PRESET: Record<string, AspectPresetId | null> = {
  "1:1": "1:1",
  "4:3": "4:3",
  "16:9": "16:9",
  auto: null,
};

function isVideoSrc(src: string) {
  return /\.(mp4|webm)(\?|#|$)/i.test(src);
}

async function uploadBlob(blob: Blob, filename: string) {
  const fd = new FormData();
  fd.append("file", new File([blob], filename, { type: blob.type }));
  const res = await $fetch("/api/v1/uploads/image", {
    method: "POST",
    body: fd,
    isToast: false,
  });
  if (!res?.response?.ok || !res.json?.url) {
    throw new Error(res?.json?.detail || "Upload failed");
  }
  return res.json.url as string;
}

export function VideoNodeView({ node, deleteNode, updateAttributes, editor }: any) {
  const {
    src,
    poster,
    autoplay = true,
    loop = true,
    muted = true,
    controls = false,
  } = node.attrs;
  const editable = editor?.isEditable ?? false;

  return (
    <NodeViewWrapper className="relative my-4 overflow-hidden border border-(--outline) bg-(--bg)">
      <video
        src={src}
        poster={poster}
        autoPlay={autoplay}
        loop={loop}
        muted={muted}
        controls={controls}
        playsInline
        className="w-full"
      />
      {editable && (
        <div className="flex items-center justify-between gap-2 border-t border-(--outline) px-3 py-2">
          <span className="text-body-5 text-(--on-bg-low)">
            {controls ? "С управлением" : "Автовоспроизведение"}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => updateAttributes({ controls: !controls })}
              className="rounded-md px-2 py-1 text-body-5 text-(--on-bg-medium) transition-colors hover:bg-(--state-hover) hover:text-(--on-bg-high)"
            >
              {controls ? "Скрыть управление" : "Показать управление"}
            </button>
            <button
              type="button"
              onClick={deleteNode}
              aria-label="Удалить видео"
              className="inline-flex items-center justify-center rounded-md p-1.5 text-(--on-bg-low) transition-colors hover:bg-(--error-card) hover:text-(--error)"
            >
              <Trash className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </NodeViewWrapper>
  );
}

export function GalleryNodeView({ node, deleteNode, updateAttributes, editor }: any) {
  const {
    images = [],
    captions = [],
    columns = 2,
    width = "container",
    aspect = "4:3",
    videoControls = false,
  } = node.attrs;
  const editable = editor?.isEditable ?? false;
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorReplaceIdx, setEditorReplaceIdx] = useState<number | null>(null);
  const [editorSrc, setEditorSrc] = useState<string | null>(null);
  const [cropCurrent, setCropCurrent] = useState<{
    dataUrl: string;
    filename: string;
  } | null>(null);
  const cropQueueRef = useRef<File[]>([]);

  const aspectPreset = ASPECT_PRESET[aspect] ?? null;
  const hasVideo = images.some((src: string) => isVideoSrc(src));
  const aspectClass =
    GALLERY_ASPECTS.find((option) => option.value === aspect)?.className ??
    "aspect-[4/3]";
  const objectClass = aspect === "auto" ? "object-contain" : "object-cover";
  const colsClass =
    images.length === 1
      ? "grid-cols-1"
      : columns === 1
        ? "grid-cols-1"
        : columns === 2
          ? "grid-cols-2"
          : "grid-cols-3";
  const widthClass =
    width === "full"
      ? editable
        ? "-mx-5 md:-mx-16"
        : "novel-wide-block"
      : "";

  const handleRemove = (idx: number) => {
    const nextImages = [...images];
    nextImages.splice(idx, 1);
    const nextCaptions = [...captions];
    nextCaptions.splice(idx, 1);
    updateAttributes({ images: nextImages, captions: nextCaptions });
  };

  const openNextCrop = async () => {
    const next = cropQueueRef.current.shift();
    if (!next) {
      setCropCurrent(null);
      return;
    }
    setCropCurrent({
      dataUrl: await readFileAsDataURL(next),
      filename: next.name,
    });
  };

  const handleAdd = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = () => {
      if (!input.files?.length) return;
      cropQueueRef.current.push(...Array.from(input.files));
      void openNextCrop();
    };
    input.click();
  };

  const handleAddApply = async (blob: Blob, filename: string) => {
    try {
      const url = await uploadBlob(blob, filename);
      updateAttributes({
        images: [...images, url],
        captions: [...captions, ""],
      });
      toast.success("Добавлено");
    } catch (error: any) {
      toast.error(error?.message || "Не удалось загрузить");
      throw error;
    }
  };

  const handleEditorApply = async (blob: Blob, filename: string) => {
    if (editorReplaceIdx === null) return;
    try {
      const url = await uploadBlob(blob, filename);
      const nextImages = [...images];
      nextImages[editorReplaceIdx] = url;
      updateAttributes({ images: nextImages });
      toast.success("Изображение обновлено");
    } catch (error: any) {
      toast.error(error?.message || "Не удалось загрузить");
      throw error;
    } finally {
      setEditorReplaceIdx(null);
    }
  };

  return (
    <NodeViewWrapper className={cn("relative my-6", widthClass)}>
      <div className="overflow-hidden border border-(--outline) bg-(--card)">
        {images.length > 0 ? (
          <div className={cn("grid gap-1", colsClass)}>
            {images.map((src: string, idx: number) => {
              const video = isVideoSrc(src);
              return (
                <div key={`${src}-${idx}`} className="group/item relative bg-(--bg)">
                  {video ? (
                    <video
                      src={src}
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls={videoControls}
                      className={cn("w-full", aspectClass, objectClass)}
                    />
                  ) : (
                    <img
                      src={src}
                      alt={captions[idx] || ""}
                      className={cn(
                        "w-full cursor-zoom-in",
                        aspectClass,
                        objectClass,
                      )}
                    />
                  )}
                  {editable && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover/item:opacity-100">
                      {!video && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditorSrc(src);
                            setEditorReplaceIdx(idx);
                            setEditorOpen(true);
                          }}
                          aria-label="Изменить изображение"
                          className="rounded-md bg-(--card)/90 p-1.5 text-(--on-bg-high) backdrop-blur-sm hover:bg-(--card)"
                        >
                          <PencilSimple className="size-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        aria-label="Удалить изображение"
                        className="rounded-md bg-(--error-card)/90 p-1.5 text-(--error) backdrop-blur-sm hover:bg-(--error-card)"
                      >
                        <Trash className="size-3.5" />
                      </button>
                    </div>
                  )}
                  {captions[idx] && (
                    <div className="absolute right-0 bottom-0 left-0 truncate bg-black/60 p-2 text-xs text-white">
                      {captions[idx]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-4 py-10 text-center text-body-4 text-(--on-bg-low)">
            Нет изображений
          </div>
        )}

        {editable && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-(--outline) px-3 py-2">
            <span className="text-body-5 text-(--on-bg-low)">{images.length} фото</span>
            <div className="flex flex-wrap items-center justify-end gap-1">
              <div className="flex items-center gap-0.5">
                {GALLERY_ASPECTS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateAttributes({ aspect: option.value })}
                    title={`Пропорции ${option.label}`}
                    className={cn(
                      "rounded-md px-1.5 py-1 text-body-5 transition-colors",
                      aspect === option.value
                        ? "bg-(--primary) text-(--on-primary)"
                        : "text-(--on-bg-medium) hover:bg-(--state-hover) hover:text-(--on-bg-high)",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <span className="mx-0.5 h-4 w-px bg-(--outline)" />
              <button
                type="button"
                onClick={() =>
                  updateAttributes({
                    width: width === "full" ? "container" : "full",
                  })
                }
                title={width === "full" ? "Вернуть в контейнер" : "Растянуть на всю ширину"}
                className="rounded-md px-2 py-1 text-body-5 text-(--on-bg-medium) transition-colors hover:bg-(--state-hover) hover:text-(--on-bg-high)"
              >
                {width === "full" ? "В контейнере" : "На всю ширину"}
              </button>
              {hasVideo && (
                <button
                  type="button"
                  onClick={() =>
                    updateAttributes({ videoControls: !videoControls })
                  }
                  title="Управление видео"
                  className="rounded-md px-2 py-1 text-body-5 text-(--on-bg-medium) transition-colors hover:bg-(--state-hover) hover:text-(--on-bg-high)"
                >
                  {videoControls ? "Скрыть управление" : "Управление видео"}
                </button>
              )}
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-body-5 text-(--on-bg-medium) transition-colors hover:bg-(--state-hover) hover:text-(--on-bg-high)"
              >
                <Plus className="size-3.5" />
                Добавить
              </button>
              <button
                type="button"
                onClick={deleteNode}
                aria-label="Удалить галерею"
                className="inline-flex items-center justify-center rounded-md p-1.5 text-(--on-bg-low) transition-colors hover:bg-(--error-card) hover:text-(--error)"
              >
                <Trash className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {editable && (
        <>
          <ImageEditorDialog
            open={editorOpen}
            onOpenChange={setEditorOpen}
            src={editorSrc}
            defaultAspect={aspectPreset}
            lockedAspect={aspect !== "auto"}
            onApply={handleEditorApply}
          />
          <ImageEditorDialog
            open={!!cropCurrent}
            onOpenChange={(open) => {
              if (!open) {
                setCropCurrent(null);
                void openNextCrop();
              }
            }}
            src={cropCurrent?.dataUrl ?? null}
            defaultAspect={aspectPreset}
            lockedAspect={aspect !== "auto"}
            onApply={handleAddApply}
          />
        </>
      )}
    </NodeViewWrapper>
  );
}
