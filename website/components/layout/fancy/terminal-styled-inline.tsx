"use client";

import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

interface TerminalStyledInlineProps {
  command?: string;
  className?: string;
}

/**
 * Inline terminal command.
 *
 * The command wraps (`pre-wrap` + `break-words`) instead of scrolling:
 * a copyable command must never be visually truncated, and the old
 * horizontal scrollbar rendered as a heavy grey bar under the text.
 * No overflow container means no scrollbar at any width.
 *
 * Colors are monochrome design tokens only — the semantic green is
 * reserved for success states, not for brand surfaces.
 */
export function TerminalStyledInline({
  command = "git clone https://github.com/unidoka/amorfa",
  className,
}: TerminalStyledInlineProps) {
  return (
    <div
      className={cn(
        "relative mb-4 w-full min-w-0 max-w-full rounded-lg border border-(--outline) bg-(--card)",
        className,
      )}
    >
      <div className="flex items-start gap-2 py-3 pl-4 pr-2">
        <code className="min-w-0 flex-1 whitespace-pre-wrap break-words font-mono text-body-4 leading-relaxed text-(--on-bg-high)">
          <span className="select-none text-(--on-bg-low)">$ </span>
          {command}
        </code>
        <CopyButton text={command} className="mt-0.5 shrink-0" />
      </div>
    </div>
  );
}
