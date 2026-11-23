import { slugify } from "@/utils/slugify";

export interface TiptapHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

function collectText(node: any): string {
  if (!node) return "";
  if (typeof node.text === "string") return node.text;
  if (Array.isArray(node.content)) return node.content.map(collectText).join("");
  return "";
}

/**
 * Extract h2/h3 headings from a Tiptap/Novel JSON document for the TOC.
 * Uses the same slugify() as the read-only heading renderer, so ids match.
 */
export function extractTiptapHeadings(content: any): TiptapHeading[] {
  const headings: TiptapHeading[] = [];

  const visit = (node: any) => {
    if (!node || typeof node !== "object") return;
    if (
      node.type === "heading" &&
      (node.attrs?.level === 2 || node.attrs?.level === 3)
    ) {
      const text = collectText(node).trim();
      if (text) {
        headings.push({
          id: slugify(text),
          text,
          level: node.attrs.level,
        });
      }
    }
    if (Array.isArray(node.content)) node.content.forEach(visit);
  };

  visit(content);
  return headings;
}
