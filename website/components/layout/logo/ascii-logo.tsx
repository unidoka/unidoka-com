"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils";

interface AsciiLogoProps {
  ascii: string;
  /** Change this value to replay the reveal + scan animation. */
  replayKey?: number | string;
  className?: string;
}

/** Drop empty rows top/bottom but keep the horizontal centering spaces. */
function trimBlankRows(raw: string): string {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  let start = 0;
  let end = lines.length;
  while (start < end && !lines[start].trim()) start += 1;
  while (end > start && !lines[end - 1].trim()) end -= 1;
  return lines.slice(start, end).join("\n");
}

/**
 * The wordmark as animated ASCII. The entrance and scan beam live in
 * CSS; remounting via `key` is what replays them.
 */
export function AsciiLogo({ ascii, replayKey = 0, className }: AsciiLogoProps) {
  const art = useMemo(() => trimBlankRows(ascii), [ascii]);
  if (!art) return null;

  return (
    <pre key={replayKey} aria-hidden className={cn("ascii-logo", className)}>
      {art}
    </pre>
  );
}

export default AsciiLogo;
