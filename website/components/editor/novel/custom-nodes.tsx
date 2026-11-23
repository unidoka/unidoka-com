import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { GalleryNodeView } from "./node-views";
import { VideoNodeView } from "./node-views";

export const CustomImage = Node.create({
  name: "image",
  group: "block",
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: "img" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes, { class: "rounded-lg border border-(--outline) max-w-full" })];
  },
});

export const VideoNode = Node.create({
  name: "video",
  group: "block",
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      poster: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: "video" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["video", mergeAttributes(HTMLAttributes, { controls: true, class: "rounded-lg border border-(--outline) max-w-full" })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(VideoNodeView);
  },
});

export const GalleryNode = Node.create({
  name: "gallery",
  group: "block",
  draggable: true,
  addAttributes() {
    return {
      images: { default: [] },
      captions: { default: [] },
      layout: { default: "grid" },
      columns: { default: 2 },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-type='gallery']" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "gallery" })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(GalleryNodeView);
  },
});

export const ColumnsNode = Node.create({
  name: "columns",
  group: "block",
  content: "column+",
  addAttributes() {
    return {
      layout: { default: "1-1" },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-type='columns']" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "columns" }), 0];
  },
});

export const ColumnNode = Node.create({
  name: "column",
  content: "block+",
  parseHTML() {
    return [{ tag: "div[data-type='column']" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "column" }), 0];
  },
});
