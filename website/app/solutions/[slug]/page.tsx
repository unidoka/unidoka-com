import type { Metadata } from "next";
import {
  fetchPublicSolutionServer,
  fetchPublicSolutionsServer,
} from "@/utils/api/solutions";
import { pickRecommended } from "@/utils/pick-recommended";
import { getRecommendedVideo } from "@/utils/recommended-video";
import { getLocale } from "@/i18n/server";
import { SOLUTION_CUSTOM_PAGES } from "./_components/solution-custom-pages";
import { SolutionDetailClient } from "./_components/solution-detail-client";

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

  // If custom page is set, render it
  if (solution?.custom_page && SOLUTION_CUSTOM_PAGES[solution.custom_page]) {
    const CustomPage = SOLUTION_CUSTOM_PAGES[solution.custom_page];
    return <CustomPage solution={solution} />;
  }

  const all = solution ? await fetchPublicSolutionsServer() : [];
  const recommended = solution ? pickRecommended(all, solution.id) : [];
  const recommendedVideo = await getRecommendedVideo(await getLocale());

  return (
    <SolutionDetailClient
      slug={slug}
      initial={solution}
      initialRecommended={recommended}
      video={recommendedVideo}
    />
  );
}
