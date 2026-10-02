/**
 * Deterministic heading slug. Used in two places that MUST agree:
 *  - server-side TOC extraction from raw MDX
 *  - client-side <h2>/<h3> id generation from rendered children
 * Keeps latin + cyrillic letters, digits, and hyphens; collapses the rest.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]+/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/** Strip **bold**, _italic_, and `code` markers from a raw markdown heading. */
export function stripMdTokens(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .trim();
}
