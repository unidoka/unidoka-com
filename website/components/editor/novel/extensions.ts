import { ReactNodeViewRenderer } from "@tiptap/react";
import {
  HorizontalRule,
  Placeholder,
  StarterKit,
  TiptapLink,
  UploadImagesPlugin,
} from "novel";
import { CustomImage, VideoNode, GalleryNode, ColumnsNode, ColumnNode } from "./custom-nodes";
import { suggestionItems } from "./suggestion-items";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { CodeBlockNodeView } from "./code-block-view";
import Suggestion, {
  type SuggestionKeyDownProps,
  type SuggestionProps,
} from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import { SlashMenu } from "./slash-menu";
import { Extension } from "@tiptap/core";

const lowlight = createLowlight(common);

const tiptapImage = CustomImage.extend({
  addProseMirrorPlugins() {
    return [
      UploadImagesPlugin({
        imageClass: "opacity-40 rounded-sm border border-(--outline)",
      }),
    ];
  },
});

export const extensions = [
  StarterKit.configure({
    bulletList: { HTMLAttributes: { class: "list-disc pl-5" } },
    orderedList: { HTMLAttributes: { class: "list-decimal pl-5" } },
    listItem: { HTMLAttributes: { class: "mt-1" } },
    codeBlock: false,
    link: false,
    horizontalRule: false,
  }),
  TiptapLink.configure({
    HTMLAttributes: { class: "text-(--primary) underline underline-offset-4" },
  }),
  tiptapImage,
  VideoNode,
  GalleryNode,
  ColumnsNode,
  ColumnNode,
  HorizontalRule,
  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === "heading") return `Heading ${node.attrs.level}`;
      return "Нажмите '/' для команд или начните печатать...";
    },
    includeChildren: true,
  }),
  CodeBlockLowlight.configure({
    lowlight,
    HTMLAttributes: { class: "rounded-md bg-(--bg) p-4 font-mono text-sm" },
  }).extend({
    addNodeView() {
      return ReactNodeViewRenderer(CodeBlockNodeView);
    },
  }),
  Extension.create({
    name: "slashCommand",
    addProseMirrorPlugins() {
      return [
        Suggestion({
          editor: this.editor,
          char: "/",
          allowSpaces: true,
          startOfLine: true,
          command: ({ editor, range, props }) => {
            props.command({ editor, range });
          },
          items: ({ query }) => {
            return suggestionItems.filter((item) => {
              if (typeof query === "string" && query.length > 0) {
                const search = query.toLowerCase();
                return (
                  item.title.toLowerCase().includes(search) ||
                  item.searchTerms.some((term) => term.toLowerCase().includes(search))
                );
              }
              return true;
            });
          },
          render: () => {
            let component: ReactRenderer | null = null;
            let popup: any | null = null;

            return {
              onStart: (props: SuggestionProps) => {
                component = new ReactRenderer(SlashMenu, {
                  props,
                  editor: props.editor,
                });
                popup = tippy("body", {
                  getReferenceClientRect: () =>
                    props.clientRect?.() ?? new DOMRect(0, 0, 0, 0),
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: "manual",
                  placement: "bottom-start",
                  theme: "novel",
                  zIndex: 99999,
                  maxWidth: "none",
                  offset: [0, 8],
                });
              },
              onUpdate(props: SuggestionProps) {
                component?.updateProps(props);
                popup?.[0]?.setProps({
                  getReferenceClientRect: () =>
                    props.clientRect?.() ?? new DOMRect(0, 0, 0, 0),
                });
              },
              onKeyDown(props: SuggestionKeyDownProps) {
                if (props.event.key === "Escape") {
                  popup?.[0]?.hide();
                  return true;
                }
                const ref = component?.ref as
                  | { onKeyDown?: (props: SuggestionKeyDownProps) => boolean }
                  | null
                  | undefined;
                return ref?.onKeyDown?.(props) ?? false;
              },
              onExit() {
                popup?.[0]?.destroy();
                component?.destroy();
              },
            };
          },
        }),
      ];
    },
  }),
];
