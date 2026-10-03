"use client";

import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

interface TerminalStyledInlineProps {
  command?: string;
  className?: string;
}

export function TerminalStyledInline({
  command = "git clone https://github.com/unidoka/amorfa",
  className = "",
}: TerminalStyledInlineProps) {
  return (
    <div
      className={cn(
        "relative mb-4 text-left bg-(--card) border border-(--outline) rounded-lg p-4",
        className,
      )}
    >
      {/*
        overflow-x-auto → scrollbar appears ONLY when the command actually
        overflows. (The old overflow-x-scroll forced a permanent track.)

        pr-10 → reserves clearance on the right for the absolutely-
        positioned copy button, so a long command never slides under it
        when the user scrolls to the end.

        whitespace-pre → preserves the command verbatim, no wrapping;
        overflow is handled by the parent's overflow-x-auto.

        scrollbar-admin → uses the site's existing thin, theme-aware
        scrollbar styling instead of the OS default.
      */}
      <div className="overflow-x-auto scrollbar-admin pr-10">
        <pre className="text-(--green-4) font-mono text-sm leading-relaxed whitespace-pre">
          <span className="text-(--on-bg-low) select-none">$ </span>
          {command}
        </pre>
      </div>

      <CopyButton text={command} className="absolute top-2 right-2" />
    </div>
  );
}
