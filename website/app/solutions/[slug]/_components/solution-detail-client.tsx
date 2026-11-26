"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import {
  fetchPublicSolutionClient,
  fetchPublicSolutionsClient,
  type Solution,
} from "@/utils/api/solutions";
import { pickRecommended } from "@/utils/pick-recommended";
import type { RecommendedVideo } from "@/utils/recommended-video-types";
import { SolutionView } from "./solution-view";

export function SolutionDetailClient({
  slug,
  initial,
  initialRecommended,
  video = null,
}: {
  slug: string;
  initial: Solution | null;
  initialRecommended: Solution[];
  video?: RecommendedVideo | null;
}) {
  const [solution, setSolution] = useState<Solution | null>(initial);
  const [recommended, setRecommended] = useState<Solution[]>(initialRecommended);
  const [loading, setLoading] = useState(!initial);

  useEffect(() => {
    if (initial) return;
    let cancelled = false;

    (async () => {
      const one = await fetchPublicSolutionClient(slug);
      if (cancelled) return;
      if (!one) {
        setLoading(false);
        return;
      }

      setSolution(one);
      const all = await fetchPublicSolutionsClient();
      if (cancelled) return;
      setRecommended(pickRecommended(all, one.id));
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [initial, slug]);

  if (!solution) {
    if (loading) {
      return (
        <main className="pb-16 pt-24 sm:pt-28">
          <Container>
            <div className="animate-pulse space-y-4">
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
              Решение не найдено
            </p>
            <Link
              href="/solutions"
              className="text-sm text-(--primary) underline underline-offset-4 transition-opacity hover:opacity-80"
            >
              Все решения
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <SolutionView
      solution={solution}
      recommended={recommended}
      video={video}
    />
  );
}
