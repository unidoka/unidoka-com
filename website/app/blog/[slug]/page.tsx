import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { NovelReadOnly } from "@/components/editor/novel/novel-readonly";
import { extractTiptapHeadings } from "@/utils/tiptap-headings";
import { Toc } from "@/components/layout/toc/toc";
import ProjectCard from "@/components/layout/projects/project-card";
import {
  fetchPublicArticleServer,
  fetchPublicArticlesServer,
} from "@/utils/api/articles";
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchPublicArticleServer(slug);
  if (!article) return { title: "Article not found" };
  return {
    title: article.seo_title || article.title,
    description: article.meta_description || article.description || undefined,
    openGraph: {
      type: "article",
      title: article.seo_title || article.title,
      description: article.meta_description || article.description || undefined,
      images: article.cover_image_src ? [article.cover_image_src] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await fetchPublicArticleServer(slug);
  if (!article) notFound();

  const all = await fetchPublicArticlesServer();
  const recommended = [
    ...all.filter((a) => a.is_featured),
    ...all.filter((a) => !a.is_featured),
  ]
    .filter((a, index, list) => a.id !== article.id && list.findIndex((x) => x.id === a.id) === index)
    .slice(0, 3);

  const headings = extractTiptapHeadings(article.content_json);
  const date = formatDate(article.published_at || article.created_at);

  return (
    <main className="pt-24 sm:pt-28 pb-16">
      <Container>
        <div className="max-w-[820px]">
          <Link
            href="/blog"
            className="mb-8 inline-flex text-body-4 text-(--on-bg-low) transition-colors hover:text-(--primary)"
          >
            ← Все статьи
          </Link>

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
              {date && <time dateTime={article.published_at || article.created_at}>{date}</time>}
            </div>
          </header>

          {article.cover_image_src && (
            <div className="relative mb-12 aspect-[4/3] overflow-hidden rounded-3xl border border-(--outline)">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.cover_image_src}
                alt={article.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          )}

          {article.content_json ? (
            <article>
              <NovelReadOnly content={article.content_json} />
            </article>
          ) : article.description ? (
            <article className="max-w-[760px] prose prose-neutral dark:prose-invert">
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
