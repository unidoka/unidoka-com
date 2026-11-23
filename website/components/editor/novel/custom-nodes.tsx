import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
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
      autoplay: { default: true },
      loop: { default: true },
      muted: { default: true },
      controls: { default: false },
    };
  },
  parseHTML() {
    return [{ tag: "video" }];
  },
  renderHTML({ HTMLAttributes }) {
    const { controls, autoplay, loop, muted, ...rest } = HTMLAttributes;
    const attrs: Record<string, string> = {
      class: "rounded-lg border border-(--outline) max-w-full",
      playsinline: "",
    };
    if (controls) attrs.controls = "";
    if (autoplay) attrs.autoplay = "";
    if (loop) attrs.loop = "";
    if (muted) attrs.muted = "";
    return ["video", mergeAttributes(rest, attrs)];
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
      width: { default: "container" },
      aspect: { default: "4:3" },
      videoControls: { default: false },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-type='gallery']" }];
  },
  renderHTML({ HTMLAttributes }) {
    const { images, captions, columns, width, aspect, videoControls, ...rest } = HTMLAttributes;
    return [
      "div",
      mergeAttributes(rest, {
        "data-type": "gallery",
        "data-width": width,
        "data-aspect": aspect,
      }),
    ];
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
    const { layout, ...rest } = HTMLAttributes;
    return [
      "div",
      mergeAttributes(rest, {
        "data-type": "columns",
        "data-layout": layout,
      }),
      0,
    ];
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
