import type { MetadataRoute } from "next";
import {
  fetchIcalFeedUrlServer,
  fetchPublishedEventsServer,
  type EventListItem,
} from "@/utils/api/events";
import { fetchPublicSolutionsServer } from "@/utils/api/solutions";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SITE_URL = process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : "http://localhost:3000";

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          ru: SITE_URL,
          en: `${SITE_URL}/en`,
          "x-default": SITE_URL,
        },
      },
    },
    {
      url: `${SITE_URL}/events`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
      alternates: {
        languages: {
          ru: `${SITE_URL}/events`,
          en: `${SITE_URL}/en/events`,
          "x-default": `${SITE_URL}/events`,
        },
      },
    },
    {
      url: `${SITE_URL}/en/events`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
      alternates: {
        languages: {
          ru: `${SITE_URL}/events`,
          en: `${SITE_URL}/en/events`,
          "x-default": `${SITE_URL}/events`,
        },
      },
    },
    {
      url: `${SITE_URL}/solutions`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: {
          ru: `${SITE_URL}/solutions`,
          en: `${SITE_URL}/en/solutions`,
          "x-default": `${SITE_URL}/solutions`,
        },
      },
    },
    {
      url: `${SITE_URL}/en/solutions`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: {
          ru: `${SITE_URL}/solutions`,
          en: `${SITE_URL}/en/solutions`,
          "x-default": `${SITE_URL}/solutions`,
        },
      },
    },
    {
      url: `${SITE_URL}/amorfa`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: {
          ru: `${SITE_URL}/amorfa`,
          en: `${SITE_URL}/en/amorfa`,
          "x-default": `${SITE_URL}/amorfa`,
        },
      },
    },
    {
      url: `${SITE_URL}/en/amorfa`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: {
          ru: `${SITE_URL}/amorfa`,
          en: `${SITE_URL}/en/amorfa`,
          "x-default": `${SITE_URL}/amorfa`,
        },
      },
    },
    {
      url: `${SITE_URL}/vershiny_top`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: {
        languages: {
          ru: `${SITE_URL}/vershiny_top`,
          en: `${SITE_URL}/en/vershiny_top`,
          "x-default": `${SITE_URL}/vershiny_top`,
        },
      },
    },
    {
      url: `${SITE_URL}/en/vershiny_top`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: {
        languages: {
          ru: `${SITE_URL}/vershiny_top`,
          en: `${SITE_URL}/en/vershiny_top`,
          "x-default": `${SITE_URL}/vershiny_top`,
        },
      },
    },
    { url: `${SITE_URL}/docs`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/docs/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/docs/consent`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/docs/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/docs/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/docs/reviews-consent`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const [eventsRu, solutions, icalRu, icalEn] = await Promise.all([
      fetchPublishedEventsServer({ locale: "ru", limit: 500 }),
      fetchPublicSolutionsServer({}),
      fetchIcalFeedUrlServer("ru"),
      fetchIcalFeedUrlServer("en"),
    ]);

    // Only publish English event URLs when the feeds actually differ.
    const hasSeparateEnFeed = Boolean(icalEn && icalRu && icalEn !== icalRu);
    const eventsEn = hasSeparateEnFeed
      ? await fetchPublishedEventsServer({ locale: "en", limit: 500 })
      : [];

    const enBySlug = new Map<string, EventListItem>(
      eventsEn.map((event) => [event.slug, event]),
    );
    const ruBySlug = new Map<string, EventListItem>(
      eventsRu.map((event) => [event.slug, event]),
    );

    const eventRoutes = (events: EventListItem[], locale: "ru" | "en") =>
      events.map((event) => {
        const prefix = locale === "en" ? "/en" : "";
        const url = `${SITE_URL}${prefix}/events/${event.id}/${event.slug}`;
        const other = locale === "en" ? ruBySlug.get(event.slug) : enBySlug.get(event.slug);
        const otherUrl = other
          ? `${SITE_URL}${locale === "en" ? "" : "/en"}/events/${other.id}/${other.slug}`
          : undefined;
        const ruUrl = locale === "ru" ? url : otherUrl;
        const enUrl = locale === "en" ? url : otherUrl;

        return {
          url,
          lastModified: event.updated_at ? new Date(event.updated_at) : now,
          changeFrequency: "weekly" as const,
          priority: 0.7,
          ...(enUrl
            ? {
                alternates: {
                  languages: {
                    ...(ruUrl ? { ru: ruUrl } : {}),
                    en: enUrl,
                    "x-default": ruUrl ?? enUrl,
                  },
                },
              }
            : {}),
        };
      });

    const eventUrls = [
      ...eventRoutes(eventsRu, "ru"),
      ...eventRoutes(eventsEn, "en"),
    ];

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
