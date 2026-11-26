"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import {
  fetchPublicArticleClient,
  fetchPublicArticlesClient,
  type Article,
} from "@/utils/api/articles";
import { pickRecommended } from "@/utils/pick-recommended";
import type { RecommendedVideo } from "@/utils/recommended-video-types";
import { ArticleView } from "./article-view";

export function ArticleDetailClient({
  slug,
  initial,
  initialRecommended,
  video = null,
}: {
  slug: string;
  initial: Article | null;
  initialRecommended: Article[];
  video?: RecommendedVideo | null;
}) {
  const [article, setArticle] = useState<Article | null>(initial);
  const [recommended, setRecommended] = useState<Article[]>(initialRecommended);
  const [loading, setLoading] = useState(!initial);

  useEffect(() => {
    if (initial) return;
    let cancelled = false;

    (async () => {
      const one = await fetchPublicArticleClient(slug);
      if (cancelled) return;
      if (!one) {
        setLoading(false);
        return;
      }

      setArticle(one);
      const all = await fetchPublicArticlesClient(one.lang);
      if (cancelled) return;
      setRecommended(pickRecommended(all, one.id));
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [initial, slug]);

  if (!article) {
    if (loading) {
      return (
        <main className="pb-16 pt-24 sm:pt-28">
          <Container>
            <div className="max-w-[820px] animate-pulse space-y-4">
              <div className="h-12 w-2/3 rounded-lg bg-(--card)" />
              <div className="h-5 w-1/2 rounded bg-(--card)" />
              <div className="mt-8 aspect-[16/9] bg-(--card)" />
            </div>
          </Container>
        </main>
      );
    }

    return (
      <main className="pb-16 pt-24 sm:pt-28">
        <Container>
          <div className="py-32 text-center">
            <p className="mb-4 text-heading-2 text-(--on-bg-medium)">
              Статья не найдена
            </p>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <ArticleView article={article} recommended={recommended} video={video} />
  );
}
