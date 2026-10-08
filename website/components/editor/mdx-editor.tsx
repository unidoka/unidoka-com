"use client";

import * as React from "react";
import {
  MDXEditor,
  type MDXEditorMethods,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  toolbarPlugin,
  diffSourcePlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  ListsToggle,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  InsertCodeBlock,
  Separator,
  CodeToggle,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { EyeIcon, PencilSimpleIcon, CodeBlockIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type ViewMode = "wysiwyg" | "source" | "preview";

interface MdxEditorProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
}

/* ═══════════════════════════════════════════════════════════════════
   MDXEDITOR WRAPPER
   ───────────────────────────────────────────────────────────────────
   Three modes, all writing back to the same `value` string (markdown):
     • WYSIWYG  — Rich-text mode. Headings render visually, # is hidden.
     • SOURCE   — Pure Markdown mode (Obsidian-style). Shows raw syntax.
     • PREVIEW  — Read-only render. Lightweight markdown renderer.
   ═══════════════════════════════════════════════════════════════════ */
export function MdxEditor({
  value,
  onChange,
  placeholder = "Полное описание события...",
  minHeight = 320,
  className,
}: MdxEditorProps) {
  const [mode, setMode] = React.useState<ViewMode>("wysiwyg");
  const [isDark, setIsDark] = React.useState(false);
  const editorRef = React.useRef<MDXEditorMethods>(null);

  // Guards against the value ↔ onChange feedback loop.
  const lastEmittedRef = React.useRef(value);

  React.useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains("dark"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const handleChange = (md: string) => {
    lastEmittedRef.current = md;
    onChange(md);
  };

  React.useEffect(() => {
    if (value === lastEmittedRef.current) return;
    if (mode !== "preview" && editorRef.current) {
      editorRef.current.setMarkdown(value || "");
    }
    lastEmittedRef.current = value;
  }, [value, mode]);

  /* ── Shared plugin config ─────────────────────────────────────── */
  const commonPlugins = React.useMemo(
    () => [
      headingsPlugin(),
      listsPlugin(),
      quotePlugin(),
      thematicBreakPlugin(),
      markdownShortcutPlugin(),
      linkPlugin(),
      linkDialogPlugin(),
      imagePlugin({
        imageUploadHandler: async (file: File) => {
          const { uploadImage } = await import("@/utils/api/uploads");
          return uploadImage(file, file.name);
        },
        imageAutocompleteSuggestions: [],
      }),
      tablePlugin(),
      codeBlockPlugin({ defaultCodeBlockLanguage: "" }),
      codeMirrorPlugin({
        codeBlockLanguages: {
          "": "Plain Text",
          js: "JavaScript",
          ts: "TypeScript",
          tsx: "TSX",
          jsx: "JSX",
          css: "CSS",
          scss: "SCSS",
          html: "HTML",
          json: "JSON",
          md: "Markdown",
          bash: "Bash",
          shell: "Shell",
          python: "Python",
          go: "Go",
          rust: "Rust",
          sql: "SQL",
          yaml: "YAML",
        },
      }),
    ],
    [],
  );

  return (
    <div
      className={cn(
        "mdx-editor-wrapper rounded-2xl border border-(--outline-strong) bg-(--bg) overflow-hidden",
        className,
      )}
    >
      {/* ── Mode bar ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 border-b border-(--outline) bg-(--card) px-3 py-1.5">
        <span className="text-[10px] uppercase tracking-[0.18em] text-(--on-bg-low)">
          {mode === "wysiwyg" ? "ВИЗУАЛЬНЫЙ" : mode === "source" ? "MARKDOWN" : "ПРЕДПРОСМОТР"}
        </span>
        <div className="flex items-center gap-0.5">
          <ModeButton
            active={mode === "wysiwyg"}
            onClick={() => setMode("wysiwyg")}
            title="Визуальный редактор"
          >
            <PencilSimpleIcon className="size-4" />
          </ModeButton>
          <ModeButton
            active={mode === "source"}
            onClick={() => setMode("source")}
            title="Markdown (чистый)"
          >
            <CodeBlockIcon className="size-4" />
          </ModeButton>
          <ModeButton
            active={mode === "preview"}
            onClick={() => setMode("preview")}
            title="Предпросмотр"
          >
            <EyeIcon className="size-4" />
          </ModeButton>
        </div>
      </div>

      {/* ── Editor body ───────────────────────────────────────────── */}
      <div
        className="max-h-[70vh] overflow-y-auto scrollbar-terminal"
        style={{ minHeight }}
      >
        {mode === "preview" ? (
          <div className="p-5">
            {value.trim() ? (
              <MarkdownPreview source={value} />
            ) : (
              <p className="text-body-5 italic text-(--on-bg-low)">
                Здесь появится превью…
              </p>
            )}
          </div>
        ) : (
          <MDXEditor
            key={mode}
            ref={editorRef}
            markdown={value}
            onChange={handleChange}
            placeholder={placeholder}
            className={cn("mdxeditor", isDark && "dark-theme")}
            contentEditableClassName="mdx-editor-content"
            plugins={[
              ...commonPlugins,
              diffSourcePlugin({
                viewMode: mode === "source" ? "source" : "rich-text",
                diffMode: "unified",
                readOnlyDiff: true,
              }),
              toolbarPlugin({
                toolbarContents: () => (
                  <>
                    <UndoRedo />
                    <Separator />
                    <BlockTypeSelect />
                    <Separator />
                    <BoldItalicUnderlineToggles />
                    <CodeToggle />
                    <Separator />
                    <ListsToggle />
                    <Separator />
                    <CreateLink />
                    <InsertImage />
                    <InsertTable />
                    <InsertThematicBreak />
                    <Separator />
                    <InsertCodeBlock />
                  </>
                ),
              }),
            ]}
          />
        )}
      </div>
    </div>
  );
}

/* ── Mode button ─────────────────────────────────────────────────── */
function ModeButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={cn(
        "flex size-7 items-center justify-center rounded-md transition-colors",
        active
          ? "bg-(--on-bg-high) text-(--bg)"
          : "text-(--on-bg-medium) hover:bg-(--state-hover) hover:text-(--on-bg-high)",
      )}
    >
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PREVIEW RENDERER
   ═══════════════════════════════════════════════════════════════════ */
type Block =
  | { kind: "heading"; level: 1 | 2 | 3 | 4; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "code"; lang: string; code: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "quote"; text: string }
  | { kind: "hr" };

function MarkdownPreview({ source }: { source: string }) {
  const blocks = React.useMemo(() => parseBlocks(source), [source]);
  return (
    <div className="mx-auto max-w-[720px]">
      {blocks.map((b, i) => renderBlock(b, i))}
    </div>
  );
}

function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const out: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^\s*$/.test(line)) {
      i++;
      continue;
    }

    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      const lang = fence[1] || "";
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      i++;
      out.push({ kind: "code", lang, code: buf.join("\n") });
      continue;
    }

    if (/^---+\s*$/.test(line)) {
      out.push({ kind: "hr" });
      i++;
      continue;
    }

    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const level = Math.min(h[1].length, 4) as 1 | 2 | 3 | 4;
      out.push({ kind: "heading", level, text: h[2] });
      i++;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      out.push({ kind: "quote", text: buf.join(" ") });
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      out.push({ kind: "ul", items });
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      out.push({ kind: "ol", items });
      continue;
    }

    const buf: string[] = [line];
    i++;
    while (
      i < lines.length &&
      !/^\s*$/.test(lines[i]) &&
      !/^(#{1,4})\s/.test(lines[i]) &&
      !/^```/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      buf.push(lines[i]);
      i++;
    }
    out.push({ kind: "paragraph", text: buf.join(" ") });
  }
  return out;
}

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];

    if (tok.startsWith("**")) {
      out.push(
        <strong key={`${keyPrefix}-b-${k++}`} className="font-semibold text-(--on-bg-high)">
          {tok.slice(2, -2)}
        </strong>,
      );
    } else if (tok.startsWith("`")) {
      out.push(
        <code
          key={`${keyPrefix}-c-${k++}`}
          className="rounded bg-(--card) px-1.5 py-0.5 font-mono text-[0.9em] text-(--on-bg-high)"
        >
          {tok.slice(1, -1)}
        </code>,
      );
    } else if (tok.startsWith("[")) {
      const mm = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (mm) {
        out.push(
          <a
            key={`${keyPrefix}-a-${k++}`}
            href={mm[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-(--on-bg-high) underline underline-offset-2 decoration-(--on-bg-low) hover:decoration-(--on-bg-high)"
          >
            {mm[1]}
          </a>,
        );
      } else {
        out.push(tok);
      }
    } else if (tok.startsWith("*")) {
      out.push(
        <em key={`${keyPrefix}-i-${k++}`} className="italic">
          {tok.slice(1, -1)}
        </em>,
      );
    }
    last = m.index + tok.length;
  }

  if (last < text.length) out.push(text.slice(last));
  return out;
}

function renderBlock(b: Block, i: number) {
  switch (b.kind) {
    case "heading": {
      const cls = [
        "text-display-4 mt-6 mb-3 text-(--on-bg-high) tracking-tight",
        "text-display-4 mt-6 mb-3 text-(--on-bg-high) tracking-tight",
        "text-heading-2 mt-5 mb-2 text-(--on-bg-high)",
        "text-heading-3 mt-4 mb-2 text-(--on-bg-high)",
      ][b.level - 1];
      const Tag = (`h${b.level}` as unknown) as keyof JSX.IntrinsicElements;
      return (
        <Tag key={i} className={cls}>
          {renderInline(b.text, `h${i}`)}
        </Tag>
      );
    }
    case "paragraph":
      return (
        <p key={i} className="text-body-3 text-(--on-bg-medium) leading-[1.7] mb-4">
          {renderInline(b.text, `p${i}`)}
        </p>
      );
    case "code":
      return (
        <pre
          key={i}
          className="my-4 overflow-x-auto scrollbar-terminal rounded-lg border border-(--outline) bg-(--card) p-4 text-[12px] font-mono leading-relaxed text-(--on-bg-medium)"
        >
          <code>{b.code}</code>
        </pre>
      );
    case "ul":
      return (
        <ul
          key={i}
          className="mb-4 list-disc space-y-1 pl-6 text-body-3 text-(--on-bg-medium) leading-[1.7]"
        >
          {b.items.map((it, idx) => (
            <li key={idx}>{renderInline(it, `ul${i}-${idx}`)}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol
          key={i}
          className="mb-4 list-decimal space-y-1 pl-6 text-body-3 text-(--on-bg-medium) leading-[1.7]"
        >
          {b.items.map((it, idx) => (
            <li key={idx}>{renderInline(it, `ol${i}-${idx}`)}</li>
          ))}
        </ol>
      );
    case "quote":
      return (
        <blockquote
          key={i}
          className="my-4 border-l-2 border-(--on-bg-low) pl-4 text-body-3 italic text-(--on-bg-medium)"
        >
          {renderInline(b.text, `q${i}`)}
        </blockquote>
      );
    case "hr":
      return <hr key={i} className="my-6 border-(--outline)" />;
  }
}
