"use client";

/* Remote README imagery (shields badges, screenshots) comes from arbitrary
   hosts, so next/image would need a remotePatterns entry per host. Plain
   <img> is the correct tool for third-party markdown content. */
/* eslint-disable @next/next/no-img-element */

import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { ArrowUpRightIcon, CheckIcon } from "@phosphor-icons/react";
import { Container } from "@/components/ui/container";
import { TerminalStyledInline } from "@/components/layout/fancy/terminal-styled-inline";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

const REPO_URL = "https://github.com/unidoka/amorfa";
const README_RAW =
  "https://raw.githubusercontent.com/unidoka/amorfa/main/README.md";
const README_BLOB = `${REPO_URL}/blob/main/README.md`;
const CLONE = "git clone https://github.com/unidoka/amorfa";

/* Hard ceilings. A README is a document, not a program - if it ever exceeds
   these, we render what fits rather than risk the tab. */
const MAX_SOURCE = 120_000;
const MAX_BLOCKS = 1_200;
const MAX_INLINE_NODES = 400;
const MAX_DEPTH = 4;

/* ── Link resolution ────────────────────────────────────────────────────────
   README links are written relative to the repository. Rewriting them keeps
   every link in the panel functional instead of pointing at our own origin. */
function resolveHref(href: string): string {
  if (/^(https?:)?\/\//i.test(href) || href.startsWith("mailto:")) return href;
  if (href.startsWith("#")) return `${REPO_URL}#${href.slice(1)}`;
  return `${REPO_URL}/blob/main/${href.replace(/^\.?\/+/, "")}`;
}

function resolveSrc(src: string): string {
  if (/^(https?:)?\/\//i.test(src) || src.startsWith("data:")) return src;
  return `${REPO_URL}/raw/main/${src.replace(/^\.?\/+/, "")}`;
}

function plainText(s: string): string {
  return s
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

/* ── Inline markdown ──────────────────────────────────────────────────────
   The pattern lives here as a source of truth only. Each call builds its own
   RegExp and walks it with matchAll, which never mutates a shared scanner -
   that sharing is exactly what made nested tokens loop forever. */
const INLINE_RE =
  /(!\[[^\]]*\]\([^)\s]+\)|\[[^\]]+\]\([^)\s]+\)|`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|_[^_\n]+_)/g;

const LINK_CLS =
  "text-(--on-bg-high) underline underline-offset-2 decoration-(--on-bg-low) transition-colors hover:decoration-(--on-bg-high)";
const CODE_CLS =
  "text-code rounded-md border border-(--outline) bg-(--bg) px-1.5 py-0.5 text-[0.85em] text-(--on-bg-high)";

function renderInline(
  text: string,
  k: { n: number },
  depth = 0,
): ReactNode[] {
  const out: ReactNode[] = [];
  if (!text) return out;

  // Beyond the nesting budget we stop interpreting and show the text.
  if (depth >= MAX_DEPTH) {
    out.push(plainText(text));
    return out;
  }

  const re = new RegExp(INLINE_RE.source, "g");
  let last = 0;

  for (const m of text.matchAll(re)) {
    const index = m.index ?? 0;
    const tok = m[0];
    if (!tok) continue;

    if (index > last) out.push(plainText(text.slice(last, index)));

    if (tok.startsWith("![")) {
      const im = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(tok);
      if (im) {
        const src = resolveSrc(im[2]);
        const badge = /shields\.io|badge/i.test(src);
        out.push(
          <img
            key={k.n++}
            src={src}
            alt={im[1]}
            loading="lazy"
            className={
              badge
                ? "mr-1 inline-block h-5 w-auto align-middle"
                : "my-3 block h-auto max-w-full rounded-xl border border-(--outline)"
            }
          />,
        );
      } else {
        out.push(plainText(tok));
      }
    } else if (tok.startsWith("[")) {
      const lm = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(tok);
      if (lm) {
        out.push(
          <a
            key={k.n++}
            href={resolveHref(lm[2])}
            target="_blank"
            rel="noopener noreferrer"
            className={LINK_CLS}
          >
            {renderInline(lm[1], k, depth + 1)}
          </a>,
        );
      } else {
        out.push(plainText(tok));
      }
    } else if (tok.startsWith("`")) {
      out.push(
        <code key={k.n++} className={CODE_CLS}>
          {tok.slice(1, -1)}
        </code>,
      );
    } else if (tok.startsWith("**") || tok.startsWith("__")) {
      out.push(
        <strong key={k.n++} className="text-(--on-bg-high)">
          {renderInline(tok.slice(2, -2), k, depth + 1)}
        </strong>,
      );
    } else {
      out.push(
        <em key={k.n++}>{renderInline(tok.slice(1, -1), k, depth + 1)}</em>,
      );
    }

    last = index + tok.length;
    if (out.length >= MAX_INLINE_NODES) break;
  }

  if (last < text.length) out.push(plainText(text.slice(last)));
  return out;
}

/* ── Block markdown ─────────────────────────────────────────────────────── */
const HEAD_CLS = [
  "text-heading-2 mt-8 mb-3",
  "text-heading-3 mt-7 mb-2.5",
  "text-heading-4 mt-6 mb-2",
  "text-heading-5 mt-5 mb-2",
  "text-heading-5 mt-5 mb-2",
  "text-heading-6 mt-4 mb-1.5",
];

const isBlank = (s: string) => !s.trim();

const startsBlock = (s: string) =>
  /^\s*(```|~~~)/.test(s) ||
  /^#{1,6}\s+/.test(s) ||
  /^\s*>/.test(s) ||
  /^\s*[-*+]\s+/.test(s) ||
  /^\s*\d+[.)]\s+/.test(s) ||
  /^\s{0,3}(-{3,}|\*{3,}|_{3,})\s*$/.test(s) ||
  s.trim().startsWith("|");

function renderMarkdown(md: string): ReactNode[] {
  const lines = md.slice(0, MAX_SOURCE).replace(/\r\n?/g, "\n").split("\n");
  const out: ReactNode[] = [];
  const k = { n: 0 };
  let i = 0;
  let guard = 0;

  // The guard is a termination guarantee: even if a branch below ever failed
  // to advance the cursor, the loop still ends instead of freezing the tab.
  while (i < lines.length && guard++ < lines.length * 2 + 64) {
    if (out.length >= MAX_BLOCKS) break;
    const line = lines[i];

    if (isBlank(line)) {
      i++;
      continue;
    }

    /* Fenced code */
    const fence = /^\s*(```|~~~)\s*([\w+-]*)\s*$/.exec(line);
    if (fence) {
      const marker = fence[1];
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(marker)) {
        buf.push(lines[i]);
        i++;
      }
      i++;
      out.push(
        <pre
          key={k.n++}
          className="text-code my-4 overflow-x-auto rounded-2xl border border-(--outline) bg-(--bg) p-4 text-[12.5px] leading-[1.7] text-(--on-bg-medium) scrollbar-terminal"
        >
          <code>{buf.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    /* Rule */
    if (/^\s{0,3}(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      out.push(<hr key={k.n++} className="my-6 border-t border-(--outline)" />);
      i++;
      continue;
    }

    /* Heading — shifted two levels down so the section keeps the outline */
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      out.push(
        createElement(
          `h${Math.min(level + 2, 6)}`,
          {
            key: k.n++,
            className: cn(
              HEAD_CLS[level - 1],
              "leading-snug text-(--on-bg-high) first:mt-0",
            ),
          },
          renderInline(h[2].trim(), k),
        ),
      );
      i++;
      continue;
    }

    /* Quote */
    if (/^\s*>/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      out.push(
        <blockquote
          key={k.n++}
          className="my-4 border-l-2 border-(--outline) pl-4 text-body-3 italic leading-[1.7] text-(--on-bg-medium)"
        >
          {renderInline(buf.join(" "), k)}
        </blockquote>,
      );
      continue;
    }

    /* Table — hairline under the head only, never a boxed grid */
    if (
      line.trim().startsWith("|") &&
      i + 1 < lines.length &&
      /^[\s|:-]+$/.test(lines[i + 1]) &&
      lines[i + 1].includes("-") &&
      lines[i + 1].includes("|")
    ) {
      const cells = (row: string) =>
        row
          .trim()
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((c) => c.trim());
      const head = cells(line);
      i += 2;
      const body: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        body.push(cells(lines[i]));
        i++;
      }
      out.push(
        <div key={k.n++} className="my-4 overflow-x-auto scrollbar-terminal">
          <table className="w-full text-body-5">
            <thead>
              <tr>
                {head.map((c, ci) => (
                  <th
                    key={ci}
                    className="border-b border-(--outline) pb-2 pr-5 text-left text-(--on-bg-high)"
                  >
                    {renderInline(c, k)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, ci) => (
                    <td
                      key={ci}
                      className="py-2 pr-5 align-top leading-relaxed text-(--on-bg-medium)"
                    >
                      {renderInline(c, k)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    /* Lists, including task lists */
    const ul = /^\s*[-*+]\s+/.test(line);
    const ol = /^\s*\d+[.)]\s+/.test(line);
    if (ul || ol) {
      const re = ul ? /^\s*[-*+]\s+/ : /^\s*\d+[.)]\s+/;
      const raw: string[] = [];
      while (i < lines.length && re.test(lines[i])) {
        raw.push(lines[i].replace(re, ""));
        i++;
      }
      const items = raw.map((r) => {
        const task = /^\[([ xX])\]\s*(.*)$/.exec(r);
        return task
          ? { task: true, checked: task[1].toLowerCase() === "x", text: task[2] }
          : { task: false, checked: false, text: r };
      });
      const hasTask = items.some((p) => p.task);

      out.push(
        createElement(
          ul ? "ul" : "ol",
          {
            key: k.n++,
            className: cn(
              "my-3 text-body-3 leading-[1.7] text-(--on-bg-medium)",
              hasTask
                ? "list-none space-y-2 pl-0"
                : cn(
                    "space-y-1.5 pl-5 marker:text-(--on-bg-low)",
                    ul ? "list-disc" : "list-decimal",
                  ),
            ),
          },
          items.map((p, idx) => (
            <li
              key={idx}
              className={hasTask ? "flex items-start gap-2.5" : undefined}
            >
              {hasTask &&
                (p.task ? (
                  <span
                    className={cn(
                      "mt-1 flex size-4 shrink-0 items-center justify-center rounded-[4px] border",
                      p.checked
                        ? "border-(--on-bg-high) bg-(--on-bg-high) text-(--bg)"
                        : "border-(--outline)",
                    )}
                  >
                    {p.checked && (
                      <CheckIcon className="size-2.5" weight="bold" />
                    )}
                  </span>
                ) : (
                  <span
                    aria-hidden
                    className="mt-2.5 size-1 shrink-0 rounded-full bg-(--on-bg-low)"
                  />
                ))}
              <span className="min-w-0">{renderInline(p.text, k)}</span>
            </li>
          )),
        ),
      );
      continue;
    }

    /* Paragraph */
    const buf: string[] = [line];
    i++;
    while (i < lines.length && !isBlank(lines[i]) && !startsBlock(lines[i])) {
      buf.push(lines[i]);
      i++;
    }
    out.push(
      <p
        key={k.n++}
        className="my-3 text-body-3 leading-[1.7] text-(--on-bg-medium) first:mt-0"
      >
        {renderInline(buf.join(" "), k)}
      </p>,
    );
  }

  return out;
}

/* ── Section ────────────────────────────────────────────────────────────── */
export function StructureSection() {
  const { t } = useLanguage();
  const [readme, setReadme] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 9000);

    fetch(README_RAW, { signal: ac.signal })
      .then((r) =>
        r.ok ? r.text() : Promise.reject(new Error(String(r.status))),
      )
      .then((text) => {
        const trimmed = text.trim();
        // An HTML error page or an empty body is not a README.
        if (!trimmed || trimmed.startsWith("<")) return;
        setReadme(trimmed);
      })
      .catch(() => {
        /* Section stays hidden - no placeholder, no stale tree. */
      })
      .finally(() => clearTimeout(timer));

    return () => {
      clearTimeout(timer);
      ac.abort();
    };
  }, []);

  // Parsing is isolated: a malformed document hides the section rather than
  // taking the whole route down with it.
  const nodes = useMemo(() => {
    if (!readme) return null;
    try {
      const rendered = renderMarkdown(readme);
      return rendered.length > 0 ? rendered : null;
    } catch {
      return null;
    }
  }, [readme]);

  const updateFade = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const overflows = el.scrollHeight - el.clientHeight > 8;
    const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    setFade(overflows && !atEnd);
  }, []);

  useEffect(() => {
    if (!nodes) return;
    const el = scrollRef.current;
    if (!el) return;
    updateFade();
    const ro = new ResizeObserver(updateFade);
    ro.observe(el);
    return () => ro.disconnect();
  }, [nodes, updateFade]);

  if (!nodes) return null;

  return (
    <section className="py-16 md:py-24">
      <Container variant="full-width">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_1.25fr] lg:gap-20">
          {/* Statement stays put while the document scrolls beside it. */}
          <div className="lg:sticky lg:top-28">
            <h2 className="mb-6 text-display-3 leading-[1.05]! md:text-display-2">
              {t("amorfa.structure_title")}
            </h2>
            <p className="mb-6 max-w-[560px] text-body-2 leading-relaxed text-(--on-bg-medium)">
              {t("amorfa.structure_body_1")}
            </p>
            <p className="max-w-[560px] text-body-2 leading-relaxed text-(--on-bg-medium)">
              {t("amorfa.structure_body_2")}
            </p>
            <div className="mt-8">
              <TerminalStyledInline command={CLONE} className="mb-0" />
            </div>
          </div>

          <div className="min-w-0">
            <div className="overflow-hidden rounded-3xl border border-(--outline) bg-(--card)">
              <div className="flex items-center justify-between gap-4 border-b border-(--outline) px-5 py-3.5">
                <span className="text-code text-body-5 text-(--on-bg-low)">
                  README.md
                </span>
                <a
                  href={README_BLOB}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-body-5 text-(--on-bg-medium) transition-colors hover:text-(--on-bg-high)"
                >
                  GitHub
                  <ArrowUpRightIcon className="size-3.5" />
                </a>
              </div>

              <div className="relative">
                <div
                  ref={scrollRef}
                  onScroll={updateFade}
                  className="max-h-[560px] overflow-y-auto px-6 py-6 scrollbar-admin md:px-8"
                >
                  {nodes}
                </div>
                <div
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-(--card) to-transparent transition-opacity duration-300",
                    fade ? "opacity-100" : "opacity-0",
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default StructureSection;
