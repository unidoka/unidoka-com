import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { slugify, stripMdTokens } from "@/utils/slugify";

export interface LegalHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface LegalDocMeta {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  publishedAt: string;
  publishedAtLabel: string;
  /** Body with frontmatter stripped - passed to compileMDX. */
  body: string;
  headings: LegalHeading[];
}

export const LEGAL_DOC_ORDER = [
  "privacy",
  "consent",
  "cookies",
  "terms",
  "reviews-consent",
] as const;

export type LegalDocSlug = (typeof LEGAL_DOC_ORDER)[number];

const CONTENT_DIR = path.join(process.cwd(), "app/_data/legal/content");

function substituteEnv(body: string): string {
  const fallbacks: Record<string, string> = {
    CONTACT_EMAIL: "unidoka.com@mail.ru",
    CONTACT_PHONE: "+7 937 580-34-14",
    COMPANY_NAME: "самозанятый Гимадиев Нияз Наилевич",
    COMPANY_INN: "165917274919",
  };
  return body.replace(/\{\{([A-Z_]+)\}\}/g, (_, key: string) => {
    const value = process.env[`NEXT_PUBLIC_${key}`];
    return value && value.trim().length > 0 ? value : (fallbacks[key] ?? "");
  });
}

function extractHeadings(body: string): LegalHeading[] {
  const headings: LegalHeading[] = [];
  const regex = /^(#{2,3})\s+(.+?)\s*$/gm;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(body)) !== null) {
    const level = match[1].length as 2 | 3;
    const text = stripMdTokens(match[2].trim());
    headings.push({ id: slugify(text), text, level });
  }
  return headings;
}

function loadDoc(slug: LegalDocSlug): LegalDocMeta | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const source = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(source);
  const body = substituteEnv(content);
  return {
    slug,
    title: data.title ?? slug,
    shortTitle: data.shortTitle ?? data.title ?? slug,
    description: data.description ?? "",
    publishedAt: data.publishedAt ?? "",
    publishedAtLabel: data.publishedAtLabel ?? "",
    body,
    headings: extractHeadings(body),
  };
}

export const LEGAL_DOCS: Record<string, LegalDocMeta> = Object.fromEntries(
  LEGAL_DOC_ORDER.map((slug) => [slug, loadDoc(slug)])
) as Record<string, LegalDocMeta>;
