import { readFileSync } from "node:fs";
import path from "node:path";

let cached: string | undefined;
let vershinyCached: string | undefined;

function readMark(file: string): string {
  try {
    return readFileSync(
      path.join(process.cwd(), "components", "layout", "logo", file),
      "utf8",
    );
  } catch {
    return "";
  }
}

/**
 * ASCII mark shipped as a plain text file so it can be edited without
 * touching code. Read on the server and passed down as a string; the
 * file is listed in `outputFileTracingIncludes` so `next build` keeps
 * it for the standalone runtime.
 */
export function getLogoAscii(): string {
  if (cached !== undefined) return cached;
  cached = readMark("logo-ascii.txt");
  return cached;
}

export function getVershinyAscii(): string {
  if (vershinyCached !== undefined) return vershinyCached;
  vershinyCached = readMark("vershiny-ascii.txt");
  return vershinyCached;
}
