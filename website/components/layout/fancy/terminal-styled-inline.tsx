"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

interface TerminalStyledInlineProps {
  command?: string;
  className?: string;
}

/**
 * Inline terminal command.
 *
 * Scrollbar contract:
 *   - content fits   → no scrollbar, no fade, nothing to interact with
 *   - content overflows → scrollbar exists but is fully transparent;
 *     it fades in on hover / focus-within (see globals.css,
 *     `.terminal-scroll[data-overflow="true"]`)
 *
 * Overflow is measured, not guessed: a ResizeObserver watches both the
 * scroll container and the <code> element, so font-load and layout
 * shifts re-evaluate the state. `atEnd` retracts the right-edge fade
 * once the tail of the command is visible.
 */
export function TerminalStyledInline({
  command = "git clone https://github.com/unidoka/amorfa",
  className = "",
}: TerminalStyledInlineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [atEnd, setAtEnd] = useState(false);

  const check = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const over = el.scrollWidth - el.clientWidth > 1;
    setOverflowing(over);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    if (codeRef.current) ro.observe(codeRef.current);
    // Re-measure once webfonts settle - mono metrics change the width.
    document.fonts?.ready.then(check).catch(() => {});
    return () => ro.disconnect();
  }, [check, command]);

  return (
    <div
      className={cn(
        "relative mb-4 w-full min-w-0 max-w-full rounded-lg border border-(--outline) bg-(--card)",
        className,
      )}
    >
      <div className="flex items-start gap-2 py-3 pl-4 pr-2">
        <div
          ref={scrollRef}
          data-overflow={overflowing ? "true" : "false"}
          data-at-end={atEnd ? "true" : "false"}
          onScroll={check}
          className="terminal-scroll min-w-0 flex-1 overflow-x-auto overflow-y-hidden"
        >
          <code
            ref={codeRef}
            className="block w-max whitespace-pre font-mono text-sm leading-relaxed text-(--on-bg-high)"
          >
            <span className="select-none text-(--on-bg-low)">$ </span>
            {command}
          </code>
        </div>
        <CopyButton text={command} className="mt-0.5 shrink-0" />
      </div>
    </div>
  );
}
