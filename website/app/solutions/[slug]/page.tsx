import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { NovelReadOnly } from "@/components/editor/novel/novel-readonly";
import { extractMdxHeadings } from "@/utils/mdx-headings";
import { extractTiptapHeadings } from "@/utils/tiptap-headings";
import { Toc } from "@/components/layout/toc/toc";
import ProjectCard from "@/components/layout/projects/project-card";
import {
  fetchPublicSolutionServer,
  fetchPublicSolutionsServer,
  type Solution,
} from "@/utils/api/solutions";
import { solutionToProject } from "@/utils/solution-to-project";
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

  const all = await fetchPublicSolutionsServer();
  const recommended = [
    ...all.filter((s) => s.is_featured),
    ...all.filter((s) => !s.is_featured),
  ]
    .filter((s, index, list) => s.id !== solution.id && list.findIndex((x) => x.id === s.id) === index)
    .slice(0, 3);

  // Extract headings for TOC
  const headings = solution.content_json
    ? extractTiptapHeadings(solution.content_json)
    : extractMdxHeadings(solution.mdx_content ?? "");

  return (
    <main className="pt-24 sm:pt-28 pb-16">
      <Container>
        <div className="max-w-[820px]">
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
            <article>
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

          {(solution.tech_stack || []).length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {solution.tech_stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-(--outline) px-3 py-1 text-body-5 text-(--on-bg-medium)"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>

        {recommended.length > 0 && (
          <section className="mt-20 border-t border-(--outline) pt-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="text-heading-2">Рекомендуем</h2>
              <Link
                href="/solutions"
                className="text-body-4 text-(--on-bg-low) transition-colors hover:text-(--primary)"
              >
                Все решения
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommended.map((s, idx) => (
                <ProjectCard
                  key={s.id}
                  project={solutionToProject(s)}
                  index={idx}
                  variant="clean"
                  href={`/solutions/${s.slug}`}
                  tags={(s.tags || [])
                    .filter((t) => t.title)
                    .map((t, i) => ({
                      id: `${s.slug}-detail-tag-${i}`,
                      label: t.title,
                    }))}
                />
              ))}
            </div>
          </section>
        )}
      </Container>

      <Toc
        headings={headings}
        label="Содержание"
        ariaLabel="Содержание страницы"
      />
    </main>
  );
}
