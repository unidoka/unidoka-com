import type { MetadataRoute } from "next";
import {
  fetchPublishedEventsServer,
  type EventListItem,
} from "@/utils/api/events";
import { shortId } from "@/utils/short-id";
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
    ...["", "/privacy", "/consent", "/cookies", "/terms", "/reviews-consent"].flatMap(
      (path) => {
        const ru = `${SITE_URL}/docs${path}`;
        const en = `${SITE_URL}/en/docs${path}`;
        const alternates = {
          languages: { ru, en, "x-default": ru },
        };
        return [
          {
            url: ru,
            lastModified: now,
            changeFrequency: "yearly" as const,
            priority: path ? 0.3 : 0.5,
            alternates,
          },
          {
            url: en,
            lastModified: now,
            changeFrequency: "yearly" as const,
            priority: path ? 0.3 : 0.5,
            alternates,
          },
        ];
      },
    ),
  ];

  try {
    const [eventsRu, eventsEn, solutions] = await Promise.all([
      fetchPublishedEventsServer({ locale: "ru", limit: 1000 }),
      fetchPublishedEventsServer({ locale: "en", limit: 1000 }),
      fetchPublicSolutionsServer({}),
    ]);

    const ruById = new Map<string, EventListItem>(
      eventsRu.map((event) => [event.id, event]),
    );
    const enById = new Map<string, EventListItem>(
      eventsEn.map((event) => [event.id, event]),
    );
    const ruBySlug = new Map<string, EventListItem>(
      eventsRu.map((event) => [event.slug, event]),
    );
    const enBySlug = new Map<string, EventListItem>(
      eventsEn.map((event) => [event.slug, event]),
    );

    const pick = (
      event: EventListItem,
      locale: "ru" | "en",
    ): EventListItem | undefined => {
      if (locale === "ru") {
        return ruById.get(event.id) ?? ruBySlug.get(event.slug);
      }
      return enById.get(event.id) ?? enBySlug.get(event.slug);
    };

    const eventRoute = (event: EventListItem, locale: "ru" | "en") => {
      const url = `${SITE_URL}${locale === "en" ? "/en" : ""}/events/${shortId(event.id)}/${event.slug}`;
      const ruEvent = pick(event, "ru");
      const enEvent = pick(event, "en");
      const ruUrl = ruEvent
        ? `${SITE_URL}/events/${shortId(ruEvent.id)}/${ruEvent.slug}`
        : undefined;
      const enUrl = enEvent
        ? `${SITE_URL}/en/events/${shortId(enEvent.id)}/${enEvent.slug}`
        : undefined;

      return {
        url,
        lastModified: event.updated_at ? new Date(event.updated_at) : now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        alternates: {
          languages: {
            ...(ruUrl ? { ru: ruUrl } : {}),
            ...(enUrl ? { en: enUrl } : {}),
            "x-default": ruUrl ?? enUrl ?? url,
          },
        },
      };
    };

    const eventUrls: MetadataRoute.Sitemap = [
      ...eventsRu.map((event) => eventRoute(event, "ru")),
      ...eventsEn.map((event) => eventRoute(event, "en")),
    ];

    const solutionUrls: MetadataRoute.Sitemap = solutions.flatMap((s) => {
      const ru = `${SITE_URL}/solutions/${s.slug}`;
      const en = `${SITE_URL}/en/solutions/${s.slug}`;
      const alternates = {
        languages: { ru, en, "x-default": ru },
      };
      const lastModified = s.updated_at ? new Date(s.updated_at) : now;
      return [
        {
          url: ru,
          lastModified,
          changeFrequency: "monthly" as const,
          priority: 0.6,
          alternates,
        },
        {
          url: en,
          lastModified,
          changeFrequency: "monthly" as const,
          priority: 0.6,
          alternates,
        },
      ];
    });

    return [...staticRoutes, ...eventUrls, ...solutionUrls];
  } catch {
    return staticRoutes;
  }
}
