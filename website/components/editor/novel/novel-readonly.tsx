"use client";

import { useState, type MouseEvent } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { readonlyExtensions } from "./readonly-extensions";
import {
  ImageViewer,
  viewerStateFromImage,
  type ViewerImage,
} from "./image-viewer";
import "@/app/novel-editor.css";

interface Props {
  content: any;
}

export function NovelReadOnly({ content }: Props) {
  const [viewer, setViewer] = useState<{
    images: ViewerImage[];
    index: number;
  } | null>(null);

  const editor = useEditor({
    extensions: readonlyExtensions as any,
    content: content ?? undefined,
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "novel-prosemirror focus:outline-none" },
    },
  });

  const openImageViewer = (event: MouseEvent<HTMLDivElement>) => {
    const image = (event.target as HTMLElement).closest("img");
    if (!image) return;
    const root = event.currentTarget.querySelector<HTMLElement>(".novel-prosemirror");
    if (!root || !root.contains(image)) return;
    const next = viewerStateFromImage(root, image as HTMLImageElement);
    if (next) setViewer(next);
  };

  return (
    <div className="novel-reader" onClick={openImageViewer}>
      {editor ? <EditorContent editor={editor} /> : null}
      <ImageViewer
        open={!!viewer}
        images={viewer?.images ?? []}
        index={viewer?.index ?? 0}
        onOpenChange={(open) => !open && setViewer(null)}
        onIndexChange={(index) =>
          setViewer((current) => (current ? { ...current, index } : current))
        }
      />
    </div>
  );
}
