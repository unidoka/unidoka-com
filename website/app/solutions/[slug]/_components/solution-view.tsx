"use client";

import Link from "next/link";
import { Container } from "@/components/ui/container";
import { NovelReadOnly } from "@/components/editor/novel/novel-readonly";
import { extractMdxHeadings } from "@/utils/mdx-headings";
import { extractTiptapHeadings } from "@/utils/tiptap-headings";
import { Toc } from "@/components/layout/toc/toc";
import ProjectCard from "@/components/layout/projects/project-card";
import { CoverMedia } from "@/components/layout/media/cover-media";
import type { Solution } from "@/utils/api/solutions";
import { solutionToProject } from "@/utils/solution-to-project";

export function SolutionView({
  solution,
  recommended,
}: {
  solution: Solution;
  recommended: Solution[];
}) {
  const headings = solution.content_json
    ? extractTiptapHeadings(solution.content_json)
    : extractMdxHeadings(solution.mdx_content ?? "");

  return (
    <main className="pb-16 pt-24 sm:pt-28">
      <Container>
        <div className="max-w-[820px]">
          <header className="mb-12">
            <h1 className="mb-4 text-display-2 md:text-display-1">{solution.title}</h1>
            {solution.short_description && (
              <p className="max-w-[760px] text-body-2 text-(--on-bg-medium)">
                {solution.short_description}
              </p>
            )}
          </header>

          <CoverMedia
            className="mb-12"
            imageSrc={solution.cover_image_src}
            videoSrc={solution.cover_video_src}
            alt={solution.title}
          />

          {solution.content_json ? (
            <article>
              <NovelReadOnly content={solution.content_json} />
            </article>
          ) : solution.mdx_content ? (
            <article className="prose prose-neutral max-w-[760px] dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: solution.mdx_content }} />
            </article>
          ) : solution.description ? (
            <article className="prose prose-neutral max-w-[760px] dark:prose-invert">
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
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
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
