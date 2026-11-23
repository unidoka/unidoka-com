import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Novel 1.0.2 imports `BubbleMenu` from the `@tiptap/react` root, but the
 * Tiptap 3 security update moved it to `@tiptap/react/menus`. Keep the
 * installed package compatible until Novel ships a Tiptap 3 release.
 */
const from =
  "import {EditorProvider,useCurrentEditor,isNodeSelection,BubbleMenu,ReactNodeViewRenderer,NodeViewWrapper,ReactRenderer}from'@tiptap/react';";
const to =
  "import {EditorProvider,useCurrentEditor,isNodeSelection,ReactNodeViewRenderer,NodeViewWrapper,ReactRenderer}from'@tiptap/react';import {BubbleMenu}from'@tiptap/react/menus';";

try {
  const file = fileURLToPath(import.meta.resolve("novel"));
  const source = readFileSync(file, "utf8");
  if (source.includes(from)) {
    writeFileSync(file, source.replace(from, to));
  }
} catch {
  // Novel is optional for tooling that installs without it.
}
