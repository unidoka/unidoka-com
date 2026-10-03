"use client";

import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

interface TerminalStyledInlineProps {
  command?: string;
  className?: string;
}

/**
 * Inline terminal command with horizontal scroll.
 *
 * Layout: a flex row containing a scroll container + a copy button.
 * The scroll container is `flex: 1 1 0` with `minWidth: 0` set as an
 * inline style — Tailwind v4 sometimes fails to emit `min-w-0` reliably
 * on this element, and without it a flex child defaults to
 * `min-width: auto`, refuses to shrink below the command's intrinsic
 * width, and no scrollbar ever appears. Inline style is the belt.
 *
 * Outer wrapper has `width: 100%` + `minWidth: 0` + `maxWidth: 100%`
 * as inline styles for the same reason — it must never be wider than
 * its parent, no matter what the parent grid/flex does.
 */
export function TerminalStyledInline({
  command = "git clone https://github.com/unidoka/amorfa",
  className = "",
}: TerminalStyledInlineProps) {
  return (
    <div
      className={cn("relative mb-4 rounded-lg border border-(--outline) bg-(--card)", className)}
      style={{ width: "100%", minWidth: 0, maxWidth: "100%" }}
    >
      <div className="flex items-start gap-2 py-3 pl-4 pr-2">
        <div
          className="scrollbar-terminal no-scrollbar!"
          style={{
            flex: "1 1 0%",
            minWidth: 0,
            overflowX: "auto",
            overflowY: "hidden",
          }}
        >
          <code
            className="block font-mono text-sm leading-relaxed whitespace-pre text-(--green-4)"
            style={{ width: "max-content" }}
          >
            <span className="text-(--on-bg-low) select-none">$ </span>
            {command}
          </code>
        </div>
        <CopyButton text={command} className="shrink-0" />
      </div>
    </div>
  );
}
