import { readFileSync } from "node:fs";
import path from "node:path";

let cached: string | undefined;

/**
 * ASCII mark shipped as a plain text file so it can be edited without
 * touching code. Read on the server and passed down as a string; the
 * file is listed in `outputFileTracingIncludes` so `next build` keeps
 * it for the standalone runtime.
 */
export function getLogoAscii(): string {
  if (cached !== undefined) return cached;
  try {
    cached = readFileSync(
      path.join(process.cwd(), "components", "layout", "logo", "logo-ascii.txt"),
      "utf8",
    );
  } catch {
    cached = "";
  }
  return cached;
}
