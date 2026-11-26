import { StarterKit, TiptapLink } from "novel";
import Heading from "@tiptap/extension-heading";
import { mergeAttributes } from "@tiptap/core";
import { CustomImage, VideoNode, GalleryNode, ColumnsNode, ColumnNode } from "./custom-nodes";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { slugify } from "@/utils/slugify";

const lowlight = createLowlight(common);

const HEADING_DISPLAY_CLASS: Record<number, string> = {
  1: "text-display-3",
  2: "text-display-4",
  3: "text-display-5",
};

const ReadonlyHeading = Heading.extend({
  renderHTML({ node, HTMLAttributes }) {
    const text = node.textContent.trim();
    const id = text ? slugify(text) : "";
    // Reuse the display ramp (text-display-3 starts at h1). Those
    // utilities also carry the 125% vertical stretch.
    const level = Math.min(Math.max(node.attrs.level, 1), 3);
    const displayClass = HEADING_DISPLAY_CLASS[level];
    return [
      `h${node.attrs.level}`,
      mergeAttributes(HTMLAttributes, id ? { id } : {}, { class: displayClass }),
      0,
    ];
  },
}).configure({ levels: [1, 2, 3] });

export const readonlyExtensions = [
  StarterKit.configure({
    bulletList: { HTMLAttributes: { class: "list-disc pl-5" } },
    orderedList: { HTMLAttributes: { class: "list-decimal pl-5" } },
    listItem: { HTMLAttributes: { class: "mt-1" } },
    codeBlock: false,
    link: false,
    heading: false,
  }),
  ReadonlyHeading,
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
