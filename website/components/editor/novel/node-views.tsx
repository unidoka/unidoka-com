"use client";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { useState } from "react";
import { Trash, Crop, Plus, Eye, PencilSimple, DotsSixVertical } from "@phosphor-icons/react";
import { ImageEditorDialog } from "../image-editor/image-editor-dialog";
import { GalleryPreviewModal } from "./gallery-preview-modal";
import { $fetch } from "@/utils/fetch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function VideoNodeView({ node, deleteNode, updateAttributes }: any) {
  const { src, poster } = node.attrs;
  return (
    <NodeViewWrapper className="relative my-4 group rounded-xl border border-(--outline) bg-(--bg) overflow-hidden">
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button onClick={deleteNode} className="p-1.5 rounded-md bg-(--error-card) text-(--error) hover:bg-[color-mix(in_srgb,var(--error),transparent_82%)]">
          <Trash className="size-4" />
        </button>
      </div>
      <video src={src} poster={poster} controls className="w-full rounded-lg" />
    </NodeViewWrapper>
  );
}

export function GalleryNodeView({ node, deleteNode, updateAttributes }: any) {
  const { images = [], captions = [], columns = 2 } = node.attrs;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorReplaceIdx, setEditorReplaceIdx] = useState<number | null>(null);
  const [editorSrc, setEditorSrc] = useState<string | null>(null);

  const handleRemove = (idx: number) => {
    const nextImages = [...images];
    nextImages.splice(idx, 1);
    const nextCaptions = [...captions];
    nextCaptions.splice(idx, 1);
    updateAttributes({ images: nextImages, captions: nextCaptions });
  };

  const handleAdd = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = async () => {
      if (!input.files?.length) return;
      const tId = toast.loading("Загрузка...");
      const newImages = [...images];
      const newCaptions = [...captions];
      for (const file of Array.from(input.files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await $fetch("/api/v1/uploads/image", { method: "POST", body: fd, isToast: false });
        if (res?.response?.ok) {
          newImages.push(res.json.url);
          newCaptions.push("");
        }
      }
      updateAttributes({ images: newImages, captions: newCaptions });
      toast.success("Добавлено", { id: tId });
    };
    input.click();
  };

  const handleEditorApply = async (blob: Blob, filename: string) => {
    if (editorReplaceIdx === null) return;
    const fd = new FormData();
    fd.append("file", new File([blob], filename, { type: blob.type }));
    const res = await $fetch("/api/v1/uploads/image", { method: "POST", body: fd, isToast: false });
    if (res?.response?.ok) {
      const nextImages = [...images];
      nextImages[editorReplaceIdx] = res.json.url;
      updateAttributes({ images: nextImages });
    }
    setEditorReplaceIdx(null);
  };

  const colsClass =
    images.length === 1
      ? "grid-cols-1"
      : columns === 1
        ? "grid-cols-1"
        : columns === 2
          ? "grid-cols-2"
          : "grid-cols-3";

  return (
    <NodeViewWrapper className="relative my-6">
      <div className="overflow-hidden rounded-xl border border-(--outline) bg-(--card)">
        {images.length > 0 ? (
          <div className={cn("grid gap-1", colsClass)}>
            {images.map((src: string, idx: number) => (
              <div key={`${src}-${idx}`} className="group/item relative bg-(--bg)">
                <img
                  src={src}
                  alt={captions[idx] || ""}
                  className="aspect-[4/3] w-full cursor-pointer object-cover"
                  onClick={() => {
                    setPreviewIndex(idx);
                    setPreviewOpen(true);
                  }}
                />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover/item:opacity-100">
                  <button
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
                  <button
                    onClick={() => handleRemove(idx)}
                    aria-label="Удалить изображение"
                    className="rounded-md bg-(--error-card)/90 p-1.5 text-(--error) backdrop-blur-sm hover:bg-(--error-card)"
                  >
                    <Trash className="size-3.5" />
                  </button>
                </div>
                {captions[idx] && (
                  <div className="absolute right-0 bottom-0 left-0 bg-black/60 p-2 text-xs text-white truncate">
                    {captions[idx]}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-10 text-center text-body-4 text-(--on-bg-low)">
            Нет изображений
          </div>
        )}
        <div className="flex items-center justify-between gap-3 border-t border-(--outline) px-3 py-2">
          <span className="text-body-5 text-(--on-bg-low)">{images.length} фото</span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-body-5 text-(--on-bg-medium) transition-colors hover:bg-(--state-hover) hover:text-(--on-bg-high)"
            >
              <Plus className="size-3.5" />
              Добавить
            </button>
            <button
              onClick={deleteNode}
              aria-label="Удалить галерею"
              className="inline-flex items-center justify-center rounded-md p-1.5 text-(--on-bg-low) transition-colors hover:bg-(--error-card) hover:text-(--error)"
            >
              <Trash className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
      <ImageEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        src={editorSrc}
        onApply={handleEditorApply}
      />
      <GalleryPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        images={images}
        currentIndex={previewIndex}
      />
    </NodeViewWrapper>
  );
}
