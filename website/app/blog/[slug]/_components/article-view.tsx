"use client";

import Link from "next/link";
import { Container } from "@/components/ui/container";
import { NovelReadOnly } from "@/components/editor/novel/novel-readonly";
import { extractTiptapHeadings } from "@/utils/tiptap-headings";
import { Toc } from "@/components/layout/toc/toc";
import ProjectCard from "@/components/layout/projects/project-card";
import { CoverMedia } from "@/components/layout/media/cover-media";
import type { Article } from "@/utils/api/articles";
import { articleToProject } from "@/utils/article-to-project";

function formatDate(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ArticleView({
  article,
  recommended,
}: {
  article: Article;
  recommended: Article[];
}) {
  const headings = extractTiptapHeadings(article.content_json);
  const date = formatDate(article.published_at || article.created_at);
  const alternates = article.translations ?? [];

  return (
    <main className="pb-16 pt-24 sm:pt-28">
      <Container>
        <div className="max-w-[820px]">
          {alternates.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {alternates.map((alternate) => (
                <Link
                  key={alternate.slug}
                  href={`/blog/${alternate.slug}`}
                  hrefLang={alternate.lang}
                  className="inline-flex items-center rounded-full border border-(--outline) px-3 py-1 text-body-5 text-(--on-bg-medium) transition-colors hover:border-(--primary)/40 hover:text-(--primary)"
                >
                  {alternate.lang === "en"
                    ? "Read in English"
                    : "Читать на русском"}
                </Link>
              ))}
            </div>
          )}
          <header className="mb-10">
            {article.category && (
              <span className="mb-3 inline-flex rounded-full border border-(--outline) px-3 py-1 text-body-5 text-(--on-bg-medium)">
                {article.category}
              </span>
            )}
            <h1 className="mb-4 text-display-2 md:text-display-1">{article.title}</h1>
            {article.description && (
              <p className="max-w-[760px] text-body-2 text-(--on-bg-medium)">
                {article.description}
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-3 text-body-5 text-(--on-bg-low)">
              {article.author_name && <span>{article.author_name}</span>}
              {article.author_name && date && <span className="opacity-40">·</span>}
              {date && (
                <time dateTime={article.published_at || article.created_at}>
                  {date}
                </time>
              )}
            </div>
          </header>

          <CoverMedia
            className="mb-12"
            imageSrc={article.cover_image_src}
            videoSrc={article.cover_video_src}
            alt={article.title}
          />

          {article.content_json ? (
            <article>
              <NovelReadOnly content={article.content_json} />
            </article>
          ) : article.description ? (
            <article className="prose prose-neutral max-w-[760px] dark:prose-invert">
              <p>{article.description}</p>
            </article>
          ) : null}

          {(article.tags || []).length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span
                  key={`${tag.title}-${index}`}
                  className="rounded-full border border-(--outline) px-3 py-1 text-body-5 text-(--on-bg-medium)"
                >
                  {tag.title}
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
                href="/blog"
                className="text-body-4 text-(--on-bg-low) transition-colors hover:text-(--primary)"
              >
                Все статьи
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {recommended.map((a, idx) => (
                <ProjectCard
                  key={a.id}
                  project={articleToProject(a)}
                  index={idx}
                  variant="clean"
                  href={`/blog/${a.slug}`}
                  tags={(a.tags || [])
                    .filter((t) => t.title)
                    .map((t, i) => ({
                      id: `${a.slug}-detail-tag-${i}`,
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
        ariaLabel="Содержание статьи"
      />
    </main>
  );
}
