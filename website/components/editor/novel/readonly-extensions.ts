import { StarterKit, TiptapLink } from "novel";
import { CustomImage, VideoNode, GalleryNode, ColumnsNode, ColumnNode } from "./custom-nodes";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);

export const readonlyExtensions = [
  StarterKit.configure({
    bulletList: { HTMLAttributes: { class: "list-disc pl-5" } },
    orderedList: { HTMLAttributes: { class: "list-decimal pl-5" } },
    listItem: { HTMLAttributes: { class: "mt-1" } },
  }),
  TiptapLink.configure({
    HTMLAttributes: { class: "text-(--primary) underline underline-offset-4" },
  }),
  CustomImage,
  VideoNode,
  GalleryNode,
  ColumnsNode,
  ColumnNode,
  CodeBlockLowlight.configure({
    lowlight,
    HTMLAttributes: { class: "rounded-md bg-(--bg) p-4 font-mono text-sm" },
  }),
];
