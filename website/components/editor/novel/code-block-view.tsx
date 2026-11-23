import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { CodeCopyButton } from "./code-copy-button";
import { FileCode, FileJs, FileTs, FileJsx, FileCss, FilePy, FileRs, Terminal, Database } from "@phosphor-icons/react";

const LANG_META: Record<string, { label: string; icon: any; tint: string }> = {
  js: { label: "JS", icon: FileJs, tint: "text-(--on-bg-medium)" },
  ts: { label: "TS", icon: FileTs, tint: "text-(--on-bg-medium)" },
  tsx: { label: "TSX", icon: FileTs, tint: "text-(--on-bg-medium)" },
  jsx: { label: "JSX", icon: FileJsx, tint: "text-(--on-bg-medium)" },
  html: { label: "HTML", icon: FileCode, tint: "text-(--on-bg-medium)" },
  css: { label: "CSS", icon: FileCss, tint: "text-(--on-bg-medium)" },
  scss: { label: "SCSS", icon: FileCss, tint: "text-(--on-bg-medium)" },
  python: { label: "Python", icon: FilePy, tint: "text-(--on-bg-medium)" },
  rust: { label: "Rust", icon: FileRs, tint: "text-(--on-bg-medium)" },
  go: { label: "Go", icon: FileCode, tint: "text-(--on-bg-medium)" },
  bash: { label: "Bash", icon: Terminal, tint: "text-(--on-bg-medium)" },
  shell: { label: "Shell", icon: Terminal, tint: "text-(--on-bg-medium)" },
  json: { label: "JSON", icon: FileCode, tint: "text-(--on-bg-medium)" },
  sql: { label: "SQL", icon: Database, tint: "text-(--on-bg-medium)" },
  null: { label: "Plain Text", icon: FileCode, tint: "text-(--on-bg-medium)" },
};

export function CodeBlockNodeView({ node, updateAttributes }: any) {
  const lang = node.attrs.language || "null";
  const meta = LANG_META[lang] || LANG_META["null"];
  const Icon = meta.icon;

  return (
    <NodeViewWrapper className="relative my-4 rounded-xl border border-(--outline) bg-(--card) overflow-hidden group">
      <div
        contentEditable={false}
        className="flex items-center justify-between px-4 py-2 border-b border-(--outline) bg-(--card)"
      >
        <div className="flex items-center gap-2 pl-1">
          <Icon className={`size-4 ${meta.tint}`} weight="fill" />
          <span className="text-xs text-(--on-bg-low) font-mono">{meta.label}</span>
        </div>
        <CodeCopyButton code={node.textContent} />
      </div>
      <pre className="p-4 overflow-x-auto">
        <NodeViewContent<"code"> as="code" className={`language-${lang} font-mono text-sm`} />
      </pre>
    </NodeViewWrapper>
  );
}
