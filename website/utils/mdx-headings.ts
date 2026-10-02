import { slugify, stripMdTokens } from "@/utils/slugify";

export interface MdxHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * Extract h2/h3 headings from raw MDX for a table of contents.
 * Uses the same slugify() the renderer uses, so the ids line up.
 */
export function extractMdxHeadings(source: string): MdxHeading[] {
  const headings: MdxHeading[] = [];
  const regex = /^(#{2,3})\s+(.+?)\s*$/gm;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(source)) !== null) {
    const level = match[1].length as 2 | 3;
    const text = stripMdTokens(match[2].trim());
    headings.push({ id: slugify(text), text, level });
  }
  return headings;
}
