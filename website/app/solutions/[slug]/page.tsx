import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { NovelReadOnly } from "@/components/editor/novel/novel-readonly";
import { extractMdxHeadings } from "@/utils/mdx-headings";
import { extractTiptapHeadings } from "@/utils/tiptap-headings";
import { Toc } from "@/components/layout/toc/toc";
import { fetchPublicSolutionServer, type Solution } from "@/utils/api/solutions";
import { SOLUTION_CUSTOM_PAGES } from "./_components/solution-custom-pages";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const solution = await fetchPublicSolutionServer(slug);
  if (!solution) return { title: "Solution not found" };
  return {
    title: solution.seo_title || solution.title,
    description: solution.meta_description || solution.short_description || undefined,
    openGraph: {
      title: solution.seo_title || solution.title,
      description: solution.meta_description || solution.short_description || undefined,
      images: solution.cover_image_src ? [solution.cover_image_src] : undefined,
    },
  };
}

export default async function SolutionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const solution = await fetchPublicSolutionServer(slug);
  if (!solution) notFound();

  // If custom page is set, render it
  if (solution.custom_page && SOLUTION_CUSTOM_PAGES[solution.custom_page]) {
    const CustomPage = SOLUTION_CUSTOM_PAGES[solution.custom_page];
    return <CustomPage solution={solution} />;
  }

  // Extract headings for TOC
  const headings = solution.content_json
    ? extractTiptapHeadings(solution.content_json)
    : extractMdxHeadings(solution.mdx_content ?? "");
  const hasToc = headings.length > 0;

  return (
    <main className="pt-24 sm:pt-28 pb-16">
      <Container>
        <div className={hasToc ? "grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12" : ""}>
          <div className="min-w-0">
            <header className="mb-12">
              <h1 className="text-display-2 md:text-display-1 mb-4">{solution.title}</h1>
              {solution.short_description && (
                <p className="text-body-2 text-(--on-bg-medium) max-w-[760px]">
                  {solution.short_description}
                </p>
              )}
            </header>

            {solution.cover_image_src && (
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-(--outline) mb-12">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={solution.cover_image_src}
                  alt={solution.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            )}

            {solution.content_json ? (
              <article className="max-w-[760px]">
                <NovelReadOnly content={solution.content_json} />
              </article>
            ) : solution.mdx_content ? (
              <article className="max-w-[760px] prose prose-neutral dark:prose-invert">
                {/* Fallback for legacy MDX if needed, though NovelReadOnly is primary */}
                <div dangerouslySetInnerHTML={{ __html: solution.mdx_content }} />
              </article>
            ) : solution.description ? (
              <article className="max-w-[760px] prose prose-neutral dark:prose-invert">
                <p>{solution.description}</p>
              </article>
            ) : null}
          </div>

          {hasToc && (
            <div className="hidden lg:block">
              <Toc headings={headings} />
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}
