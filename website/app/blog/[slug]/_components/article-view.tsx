"use client";

import Link from "next/link";
import { format } from "date-fns";
import { enUS, ru } from "date-fns/locale";
import { CalendarBlankIcon } from "@phosphor-icons/react";
import { Container } from "@/components/ui/container";
import { NovelReadOnly } from "@/components/editor/novel/novel-readonly";
import { extractTiptapHeadings } from "@/utils/tiptap-headings";
import { Toc } from "@/components/layout/toc/toc";
import ProjectCard from "@/components/layout/projects/project-card";
import { CoverMedia } from "@/components/layout/media/cover-media";
import { RecommendedVideo } from "@/components/layout/media/recommended-video";
import type { Article } from "@/utils/api/articles";
import type { RecommendedVideo as RecommendedVideoData } from "@/utils/recommended-video-types";
import { articleToProject } from "@/utils/article-to-project";

function formatArticleDate(
  value: string | null,
  lang: Article["lang"],
): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, lang === "en" ? "MMMM d, yyyy" : "d MMMM yyyy", {
    locale: lang === "en" ? enUS : ru,
  });
}

export function ArticleView({
  article,
  recommended,
  video = null,
}: {
  article: Article;
  recommended: Article[];
  video?: RecommendedVideoData | null;
}) {
  const headings = extractTiptapHeadings(article.content_json);
  const publishedValue = article.published_at || article.created_at;
  const publishedDate = formatArticleDate(publishedValue, article.lang);
  const updatedDate = formatArticleDate(article.updated_at, article.lang);
  const showUpdated =
    Boolean(article.updated_at) &&
    Boolean(publishedValue) &&
    new Date(article.updated_at).getTime() -
      new Date(publishedValue).getTime() >
      24 * 60 * 60 * 1000;
  const alternates = article.translations ?? [];
  const hasToc = headings.length > 0;

  return (
    <main className="pb-16 pt-24 sm:pt-28">
      <Container>
        <div className={hasToc ? "lg:grid lg:grid-cols-[minmax(0,820px)_200px] lg:justify-center lg:gap-12 xl:grid-cols-[minmax(0,820px)_220px] xl:gap-24" : undefined}>
          <div className="min-w-0 max-w-[820px]">
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
                <p className="text-body-2 text-(--on-bg-medium)">
                  {article.description}
                </p>
              )}
              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-body-4 text-(--on-bg-medium)">
                {article.author_name && (
                  <span className="inline-flex items-center gap-1.5 font-medium text-(--on-bg-high)">
                    {article.author_name}
                  </span>
                )}
                {publishedDate && (
                  <span className="inline-flex items-center gap-1.5 text-(--on-bg-low)">
                    <CalendarBlankIcon className="size-3.5" />
                    <time dateTime={publishedValue}>{publishedDate}</time>
                  </span>
                )}
                {showUpdated && updatedDate && (
                  <span className="inline-flex items-center gap-1.5 text-(--on-bg-low)">
                    <span className="opacity-40">·</span>
                    <span>{article.lang === "en" ? "Updated" : "Обновлено"}</span>
                    <time dateTime={article.updated_at ?? undefined}>
                      {updatedDate}
                    </time>
                  </span>
                )}
              </div>
            </header>
          </div>
        </div>
      </Container>

      <CoverMedia
        className="mb-12"
        imageSrc={article.cover_image_src}
        videoSrc={article.cover_video_src}
        alt={article.title}
        aspect={16 / 9}
        sizes="100vw"
        priority
        quality={95}
      />

      <Container>
        <div className={hasToc ? "lg:grid lg:grid-cols-[minmax(0,820px)_200px] lg:justify-center lg:gap-12 xl:grid-cols-[minmax(0,820px)_220px] xl:gap-24" : undefined}>
          <div className="min-w-0 max-w-[820px]">
            {article.content_json ? (
              <article>
                <NovelReadOnly content={article.content_json} />
              </article>
            ) : article.description ? (
              <article className="prose prose-neutral dark:prose-invert">
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

          {hasToc && (
            <aside className="hidden lg:block">
              <Toc
                headings={headings}
                label="Содержание"
                ariaLabel="Содержание статьи"
                variant="sidebar"
              />
            </aside>
          )}
        </div>

        <RecommendedVideo video={video} lang={article.lang} />

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

      {hasToc && (
        <div className="lg:hidden">
          <Toc
            headings={headings}
            label="Содержание"
            ariaLabel="Содержание статьи"
            variant="floating"
          />
        </div>
      )}
    </main>
  );
}
