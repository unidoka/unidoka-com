import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { compileMDX } from "next-mdx-remote/rsc";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import {
  LEGAL_DOCS,
  LEGAL_DOC_ORDER,
  type LegalDocSlug,
} from "@/app/_data/legal";
import { slugify } from "@/utils/slugify";
import { DocsTOC } from "../_components/docs-toc";

export function generateStaticParams() {
  return LEGAL_DOC_ORDER.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = LEGAL_DOCS[slug];
  if (!doc) return { title: "Документ не найден · Rovno.dev" };
  return {
    title: `${doc.shortTitle} · Rovno.dev`,
    description: doc.description,
  };
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return extractText(
      (node as { props: { children: React.ReactNode } }).props.children
    );
  }
  return "";
}

const mdxComponents = {
  h2: ({ children }: { children: React.ReactNode }) => {
    const id = slugify(extractText(children));
    return (
      <h2
        id={id}
        className="text-display-4 text-(--on-bg-high) mt-14 mb-4 tracking-tight scroll-mt-28"
      >
        {children}
      </h2>
    );
  },
  h3: ({ children }: { children: React.ReactNode }) => {
    const id = slugify(extractText(children));
    return (
      <h3
        id={id}
        className="text-heading-3 text-(--on-bg-high) mt-8 mb-3 scroll-mt-28"
      >
        {children}
      </h3>
    );
  },
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="text-body-3 text-(--on-bg-medium) leading-[1.75] mb-4">
      {children}
    </p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="list-disc pl-6 mb-4 space-y-2 text-body-3 text-(--on-bg-medium) leading-[1.75]">
      {children}
    </ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="list-decimal pl-6 mb-4 space-y-2 text-body-3 text-(--on-bg-medium) leading-[1.75]">
      {children}
    </ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="pl-1">{children}</li>
  ),
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-semibold text-(--on-bg-high)">{children}</strong>
  ),
  a: ({ href, children }: { href?: string; children: React.ReactNode }) => (
    <a
      href={href}
      className="text-(--primary) underline underline-offset-2 hover:opacity-80"
    >
      {children}
    </a>
  ),
};

export default async function LegalDocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = LEGAL_DOCS[slug];
  if (!doc) notFound();

  const { content } = await compileMDX({
    source: doc.body,
    components: mdxComponents,
    options: { parseFrontmatter: false },
  });

  const otherDocs = LEGAL_DOC_ORDER.filter((s) => s !== slug);

  return (
    <main className="min-h-screen bg-(--bg)">
      <section className="border-b border-(--outline) pt-12 md:pt-20 pb-10">
        <Container>
          <div className="max-w-[900px]">
            <Link
              href="/docs"
              className="inline-flex items-center gap-1.5 text-body-4 text-(--on-bg-low) hover:text-(--primary) transition-colors mb-6"
            >
              <ArrowLeftIcon className="size-4" />
              Все документы
            </Link>
            <p className="text-body-5 uppercase tracking-[0.3em] text-(--on-bg-low) mb-3">
              Правовая информация
            </p>
            <h1 className="text-display-2 md:text-display-1 text-(--on-bg-high) leading-[1.15] mb-4">
              {doc.title}
            </h1>
            <p className="text-body-4 text-(--on-bg-medium)">
              Дата публикации и вступления в силу:{" "}
              <time dateTime={doc.publishedAt}>{doc.publishedAtLabel}</time>
              {" · "}Место публикации: rovno.dev
            </p>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10 lg:gap-16">
            <article className="max-w-[760px]">{content}</article>
            <div className="space-y-8">
              <DocsTOC headings={doc.headings} />
              <nav
                aria-label="Другие документы"
                className="hidden lg:block pt-6 border-t border-(--outline)"
              >
                <p className="text-body-5 uppercase tracking-[0.25em] text-(--on-bg-low) mb-3">
                  Другие документы
                </p>
                <ul className="space-y-2 text-body-4">
                  {otherDocs.map((s) => {
                    const d = LEGAL_DOCS[s as LegalDocSlug];
                    if (!d) return null;
                    return (
                      <li key={s}>
                        <Link
                          href={`/docs/${s}`}
                          className="text-(--on-bg-medium) hover:text-(--primary) transition-colors leading-snug block"
                        >
                          {d.shortTitle}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
