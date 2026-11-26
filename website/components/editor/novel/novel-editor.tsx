"use client";
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import {
  EditorBubble,
  EditorBubbleItem,
  EditorContent,
  EditorRoot,
  handleImageDrop,
  handleImagePaste,
} from "novel";
import { extensions } from "./extensions";
import { createUploadFn } from "./image-upload";
import { registerUploadCallbacks } from "./suggestion-items";
import { cn } from "@/lib/utils";
import "tippy.js/dist/tippy.css";
import "@/app/novel-editor.css";
import {
  TextB,
  TextItalic,
  TextStrikethrough,
  Code,
  ListBullets,
  ListNumbers,
  TextHOne,
  TextHTwo,
  TextHThree,
  ImageSquare,
  ArrowCounterClockwise,
  ArrowClockwise,
  VideoCamera,
  SquaresFour,
  CodeBlock,
} from "@phosphor-icons/react";
import { ImageEditorDialog } from "../image-editor/image-editor-dialog";
import { readFileAsDataURL } from "../image-editor/canvas-utils";
import { ImageViewer, viewerStateFromImage, type ViewerImage } from "./image-viewer";
import { $fetch } from "@/utils/fetch";
import { setActiveUploadFolder } from "@/utils/api/uploads";
import { toast } from "sonner";

export interface NovelEditorProps {
  initialContent: any | null;
  onChange: (json: any) => void;
  onDirty?: () => void;
  className?: string;
  /** Storage folder for inline images/videos (e.g. "articles"). */
  folder?: string;
}

export function NovelEditor({
  initialContent,
  onChange,
  onDirty,
  className,
  folder = "misc",
}: NovelEditorProps) {
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [editor, setEditor] = useState<any>(null);
  const [cropFile, setCropFile] = useState<{
    dataUrl: string;
    pos: number;
    filename: string;
  } | null>(null);
  const [viewer, setViewer] = useState<{
    images: ViewerImage[];
    index: number;
  } | null>(null);
  const galleryQueueRef = useRef<File[]>([]);
  const galleryUrlsRef = useRef<string[]>([]);
  const galleryPosRef = useRef(0);
  const [galleryCrop, setGalleryCrop] = useState<{
    dataUrl: string;
    filename: string;
  } | null>(null);

  const schedule = useCallback(
    (json: any) => {
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => onChange(json), 350);
    },
    [onChange],
  );

  useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current);
    },
    [],
  );

  useEffect(() => {
    setActiveUploadFolder(folder);
    return () => setActiveUploadFolder("misc");
  }, [folder]);

  const uploadMediaFile = async (file: File | Blob, filename: string, isVideo: boolean) => {
    const fd = new FormData();
    fd.append("folder", folder);
    fd.append("file", file, filename);
    const endpoint = isVideo ? "/api/v1/uploads/media" : "/api/v1/uploads/image";
    const res = await $fetch(endpoint, { method: "POST", body: fd, isToast: false });
    if (!res?.response?.ok) throw new Error(res?.json?.detail || "Upload failed");
    return res.json;
  };

  const insertBlockWithTrailingParagraph = (pos: number, node: any) => {
    if (!editor) return;
    const { state } = editor;
    const $pos = state.doc.resolve(Math.min(pos, state.doc.content.size));
    const replaceEmptyBlock =
      $pos.parent.isTextblock && $pos.parent.content.size === 0;
    const from = replaceEmptyBlock ? $pos.before($pos.depth) : $pos.pos;
    const to = replaceEmptyBlock ? $pos.after($pos.depth) : $pos.pos;

    editor
      .chain()
      .focus()
      .insertContentAt({ from, to }, [node, { type: "paragraph" }])
      .run();

    const inserted = editor.state.doc.nodeAt(from);
    if (inserted) {
      editor
        .chain()
        .focus()
        .setTextSelection(from + inserted.nodeSize + 1)
        .run();
    }
  };

  const openImageViewer = (event: MouseEvent<HTMLDivElement>) => {
    const image = (event.target as HTMLElement).closest("img");
    if (!image) return;
    const root = event.currentTarget.querySelector<HTMLElement>(".novel-prosemirror");
    if (!root || !root.contains(image)) return;
    const next = viewerStateFromImage(root, image as HTMLImageElement);
    if (next) setViewer(next);
  };

  const handleImageUpload = (pos: number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      if (input.files?.length) {
        const file = input.files[0];
        const dataUrl = await readFileAsDataURL(file);
        setCropFile({ dataUrl, pos, filename: file.name });
      }
    };
    input.click();
  };

  const handleVideoUpload = (pos: number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/mp4,video/webm,video/quicktime,video/x-m4v,.mp4,.webm,.mov,.m4v";
    input.onchange = async () => {
      if (input.files?.length) {
        const file = input.files[0];
        const tId = toast.loading("Загрузка видео...");
        try {
          const data = await uploadMediaFile(file, file.name, true);
          if (data.url) {
            insertBlockWithTrailingParagraph(pos, {
              type: "video",
              attrs: {
                src: data.url,
                poster: data.poster_url,
                autoplay: true,
                loop: true,
                muted: true,
                controls: false,
              },
            });
          }
          toast.success("Видео добавлено", { id: tId });
        } catch {
          toast.error("Ошибка загрузки", { id: tId });
        }
      }
    };
    input.click();
  };

  const openNextGalleryCrop = async () => {
    const next = galleryQueueRef.current.shift();
    if (!next) {
      const urls = galleryUrlsRef.current;
      galleryUrlsRef.current = [];
      setGalleryCrop(null);
      if (urls.length > 0) {
        insertBlockWithTrailingParagraph(galleryPosRef.current, {
          type: "gallery",
          attrs: { images: urls },
        });
        toast.success("Галерея добавлена");
      } else {
        toast.error("Не удалось загрузить изображения");
      }
      return;
    }
    setGalleryCrop({
      dataUrl: await readFileAsDataURL(next),
      filename: next.name,
    });
  };

  const handleGalleryUpload = (pos: number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = () => {
      if (!input.files?.length) return;
      galleryPosRef.current = pos;
      galleryQueueRef.current.push(...Array.from(input.files));
      galleryUrlsRef.current = [];
      void openNextGalleryCrop();
    };
    input.click();
  };

  useEffect(() => {
    if (!editor) return;
    registerUploadCallbacks({
      image: () => handleImageUpload(editor.view.state.selection.from),
      video: () => handleVideoUpload(editor.view.state.selection.from),
      gallery: () => handleGalleryUpload(editor.view.state.selection.from),
    });
  }, [editor, folder]);

  const uploadFn = useMemo(() => createUploadFn(folder), [folder]);

  const editorProps = useMemo(
    () => ({
      attributes: { class: "novel-prosemirror focus:outline-none", spellcheck: "false" },
      handlePaste: (view: any, event: ClipboardEvent) => handleImagePaste(view, event, uploadFn),
      handleDrop: (view: any, event: DragEvent, _slice: any, moved: boolean) => handleImageDrop(view, event, moved, uploadFn),
    }),
    [uploadFn],
  );

  return (
    <EditorRoot>
      <div
        className={cn("novel-editor rounded-xl border border-(--outline) bg-(--card) flex flex-col relative w-full max-w-full shadow-sm", className)}
        onClick={openImageViewer}
      >
        {editor && (
          <Toolbar
            editor={editor}
            onImageUpload={handleImageUpload}
            onVideoUpload={handleVideoUpload}
            onGalleryUpload={handleGalleryUpload}
          />
        )}
        <EditorContent
          initialContent={initialContent ?? undefined}
          extensions={extensions as any}
          editorProps={editorProps}
          onUpdate={({ editor }) => {
            if (onDirty) onDirty();
            schedule(editor.getJSON());
          }}
          onCreate={({ editor }) => setEditor(editor)}
          className="flex-1 overflow-y-auto overflow-x-hidden relative"
        >
          <EditorBubble
            tippyOptions={{ duration: 100, zIndex: 99999 }}
            className="flex w-fit max-w-[90vw] overflow-hidden rounded-lg border border-(--outline) bg-(--card) shadow-xl"
          >
            <EditorBubbleItem onSelect={(ed) => ed.chain().focus().toggleBold().run()}>
              <div className="p-2 hover:bg-(--state-hover) cursor-pointer"><TextB className="size-4" /></div>
            </EditorBubbleItem>
            <EditorBubbleItem onSelect={(ed) => ed.chain().focus().toggleItalic().run()}>
              <div className="p-2 hover:bg-(--state-hover) cursor-pointer"><TextItalic className="size-4" /></div>
            </EditorBubbleItem>
            <EditorBubbleItem onSelect={(ed) => ed.chain().focus().toggleStrike().run()}>
              <div className="p-2 hover:bg-(--state-hover) cursor-pointer"><TextStrikethrough className="size-4" /></div>
            </EditorBubbleItem>
            <EditorBubbleItem onSelect={(ed) => ed.chain().focus().toggleCode().run()}>
              <div className="p-2 hover:bg-(--state-hover) cursor-pointer"><Code className="size-4" /></div>
            </EditorBubbleItem>
          </EditorBubble>
        </EditorContent>
      </div>
      <ImageEditorDialog
        open={!!cropFile}
        onOpenChange={(open) => !open && setCropFile(null)}
        src={cropFile?.dataUrl || null}
        onApply={async (blob, filename) => {
          if (!editor || !cropFile) return;
          const tId = toast.loading("Загрузка...");
          try {
            const data = await uploadMediaFile(blob, filename, false);
            if (data.url) {
              insertBlockWithTrailingParagraph(cropFile.pos, { type: "image", attrs: { src: data.url } });
            }
            toast.success("Добавлено", { id: tId });
          } catch (e: any) {
            toast.error(e.message || "Ошибка", { id: tId });
          }
          setCropFile(null);
        }}
      />
      <ImageEditorDialog
        open={!!galleryCrop}
        onOpenChange={(open) => {
          if (!open) {
            setGalleryCrop(null);
            void openNextGalleryCrop();
          }
        }}
        src={galleryCrop?.dataUrl || null}
        defaultAspect="4:3"
        lockedAspect
        onApply={async (blob, filename) => {
          try {
            const data = await uploadMediaFile(blob, filename, false);
            if (data.url) galleryUrlsRef.current.push(data.url);
          } catch (error: any) {
            toast.error(error?.message || "Не удалось загрузить изображение");
            throw error;
          }
        }}
      />
      <ImageViewer
        open={!!viewer}
        images={viewer?.images ?? []}
        index={viewer?.index ?? 0}
        onOpenChange={(open) => !open && setViewer(null)}
        onIndexChange={(index) =>
          setViewer((current) => (current ? { ...current, index } : current))
        }
      />
    </EditorRoot>
  );
}

function Toolbar({ editor, onImageUpload, onVideoUpload, onGalleryUpload }: any) {
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-(--outline) bg-(--card) p-2 shrink-0 rounded-t-xl">
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} label="Жирный" icon={<TextB className="size-4" />} />
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} label="Курсив" icon={<TextItalic className="size-4" />} />
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")} label="Зачёркнутый" icon={<TextStrikethrough className="size-4" />} />
      <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive("code")} label="Код" icon={<Code className="size-4" />} />
      <div className="w-px h-5 bg-(--outline) mx-1" />
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive("heading", { level: 1 })} label="Заголовок 1" icon={<TextHOne className="size-4" />} />
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })} label="Заголовок 2" icon={<TextHTwo className="size-4" />} />
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive("heading", { level: 3 })} label="Заголовок 3" icon={<TextHThree className="size-4" />} />
      <div className="w-px h-5 bg-(--outline) mx-1" />
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} label="Маркированный список" icon={<ListBullets className="size-4" />} />
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} label="Нумерованный список" icon={<ListNumbers className="size-4" />} />
      <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive("codeBlock")} label="Блок кода" icon={<CodeBlock className="size-4" />} />
      <div className="w-px h-5 bg-(--outline) mx-1" />
      <ToolbarButton onClick={() => onImageUpload(editor.view.state.selection.from)} label="Изображение" icon={<ImageSquare className="size-4" />} />
      <ToolbarButton onClick={() => onVideoUpload(editor.view.state.selection.from)} label="Видео" icon={<VideoCamera className="size-4" />} />
      <ToolbarButton onClick={() => onGalleryUpload(editor.view.state.selection.from)} label="Галерея" icon={<SquaresFour className="size-4" />} />
      <div className="w-px h-5 bg-(--outline) mx-1" />
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} label="Отменить" icon={<ArrowCounterClockwise className="size-4" />} />
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} label="Повторить" icon={<ArrowClockwise className="size-4" />} />
    </div>
  );
}

function ToolbarButton({ onClick, isActive, disabled, label, icon }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "p-1.5 rounded-md transition-colors",
        isActive ? "bg-(--primary) text-(--on-primary)" : "text-(--on-bg-medium) hover:bg-(--state-hover) hover:text-(--on-bg-high)",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {icon}
    </button>
  );
}
