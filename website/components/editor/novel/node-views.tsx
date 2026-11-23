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
  const { images = [], captions = [], layout = "grid", columns = 2 } = node.attrs;
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
        const res = await $fetch("/api/v1/uploads/images", { method: "POST", body: fd, isToast: false });
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
    const res = await $fetch("/api/v1/uploads/images", { method: "POST", body: fd, isToast: false });
    if (res?.response?.ok) {
      const nextImages = [...images];
      nextImages[editorReplaceIdx] = res.json.url;
      updateAttributes({ images: nextImages });
    }
    setEditorReplaceIdx(null);
  };

  const colsClass = columns === 1 ? "grid-cols-1" : columns === 2 ? "grid-cols-2" : "grid-cols-3";

  return (
    <NodeViewWrapper className="relative my-4 group">
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button onClick={handleAdd} className="p-1.5 rounded-md bg-(--primary)/20 text-(--primary) hover:bg-(--primary)/30">
          <Plus className="size-4" />
        </button>
        <button onClick={deleteNode} className="p-1.5 rounded-md bg-(--error-card) text-(--error) hover:bg-[color-mix(in_srgb,var(--error),transparent_82%)]">
          <Trash className="size-4" />
        </button>
      </div>
      <div className={cn("grid gap-3", colsClass)}>
        {images.map((src: string, idx: number) => (
          <div key={idx} className="relative group/item rounded-xl overflow-hidden border border-(--outline) bg-(--bg)">
            <img
              src={src}
              alt={captions[idx] || ""}
              className="w-full h-48 object-cover cursor-pointer"
              onClick={() => {
                setPreviewIndex(idx);
                setPreviewOpen(true);
              }}
            />
            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
              <button
                onClick={() => {
                  setEditorSrc(src);
                  setEditorReplaceIdx(idx);
                  setEditorOpen(true);
                }}
                className="p-1 rounded bg-black/50 text-white hover:bg-black/70"
              >
                <PencilSimple className="size-3" />
              </button>
              <button onClick={() => handleRemove(idx)} className="p-1 rounded bg-(--error) text-(--on-error) hover:bg-[color-mix(in_srgb,var(--error),black_10%)]">
                <Trash className="size-3" />
              </button>
            </div>
            {captions[idx] && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 truncate">
                {captions[idx]}
              </div>
            )}
          </div>
        ))}
        <button
          onClick={handleAdd}
          className="flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed border-(--outline) bg-(--bg)/50 hover:bg-(--state-hover) transition-colors text-(--on-bg-low)"
        >
          <Plus className="size-6 mb-1" />
          <span className="text-xs">Добавить</span>
        </button>
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
