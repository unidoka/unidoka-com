import type { Metadata } from "next";
import {
  fetchPublicArticleServer,
  fetchPublicArticlesServer,
} from "@/utils/api/articles";
import { pickRecommended } from "@/utils/pick-recommended";
import { getRecommendedVideo } from "@/utils/recommended-video";
import { getLocale } from "@/i18n/server";
import { ArticleDetailClient } from "./_components/article-detail-client";

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
  const all = article
    ? await fetchPublicArticlesServer({ lang: article.lang })
    : [];
  const recommended = article ? pickRecommended(all, article.id) : [];
  const videoLang = article?.lang ?? (await getLocale());
  const recommendedVideo = await getRecommendedVideo(videoLang);

  return (
    <ArticleDetailClient
      slug={slug}
      initial={article}
      initialRecommended={recommended}
      video={recommendedVideo}
    />
  );
}
