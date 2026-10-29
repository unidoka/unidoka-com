import type { MetadataRoute } from "next";
import { fetchPublishedEventsServer } from "@/utils/api/events";
import { fetchPublicSolutionsServer } from "@/utils/api/solutions";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SITE_URL = process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : "http://localhost:3000";

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/events`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/solutions`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/amorfa`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/vershiny_top`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/docs`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/docs/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/docs/consent`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/docs/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/docs/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/docs/reviews-consent`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const [events, solutions] = await Promise.all([
      fetchPublishedEventsServer(),
      fetchPublicSolutionsServer({}),
    ]);

    const eventUrls: MetadataRoute.Sitemap = events.map((e) => ({
      url: `${SITE_URL}/events/${e.id}/${e.slug}`,
      lastModified: e.updated_at ? new Date(e.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    const solutionUrls: MetadataRoute.Sitemap = solutions.map((s) => ({
      url: `${SITE_URL}/solutions/${s.slug}`,
      lastModified: s.updated_at ? new Date(s.updated_at) : now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    return [...staticRoutes, ...eventUrls, ...solutionUrls];
  } catch {
    return staticRoutes;
  }
}
