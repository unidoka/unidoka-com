import {
  fetchIcalFeedsServer,
  fetchPublishedEventsServer,
  type EventListItem,
} from "@/utils/api/events";
import { shortId } from "@/utils/short-id";

export const dynamic = "force-dynamic";

function siteOrigin(): string {
  const proto = process.env.NEXT_PUBLIC_HTTP_PROTOCOL || "https";
  const rawRoot = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "").trim();
  const cleanRoot = rawRoot.replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
  return cleanRoot ? `${proto}://${cleanRoot}` : "http://localhost:3000";
}

function plainText(value: string | null | undefined): string {
  return (value || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>?/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function eventLine(event: EventListItem, siteUrl: string, locale: "ru" | "en") {
  const prefix = locale === "en" ? "/en" : "";
  const date = event.start_at ? event.start_at.slice(0, 10) : "date TBD";
  const tags = (event.tags ?? []).map((tag) => `#${tag.name}`).join(" ");
  const category = (event.categories ?? []).join(", ");
  const location = plainText(event.location_name);
  const meta = [date, category, location, tags].filter(Boolean).join(" · ");
  const description = plainText(event.short_description).slice(0, 300);
  return `- [${plainText(event.title)}](${siteUrl}${prefix}/events/${shortId(event.id)}/${event.slug}) - ${meta}${description ? ` — ${description}` : ""}`;
}

export async function GET() {
  const siteUrl = siteOrigin();
  const [ruEvents, enEvents, ruFeeds, enFeeds] = await Promise.all([
    fetchPublishedEventsServer({ locale: "ru", limit: 200 }),
    fetchPublishedEventsServer({ locale: "en", limit: 200 }),
    fetchIcalFeedsServer("ru"),
    fetchIcalFeedsServer("en"),
  ]);

  const feedLinks = [
    ...Object.entries(ruFeeds)
      .filter(([, url]) => Boolean(url))
      .map(
        ([category, url]) => `- [Calendar feed ${category} (RU)](${url})`,
      ),
    ...Object.entries(enFeeds)
      .filter(([category, url]) => url && url !== ruFeeds[category as keyof typeof ruFeeds])
      .map(
        ([category, url]) => `- [Calendar feed ${category} (EN)](${url})`,
      ),
  ];

  const lines = [
    "# Unidoka",
    "",
    "> Unidoka is a community and platform for building future solutions and developing specialists. The public events calendar lists conferences, forums, hackathons, meetups, internships and practices.",
    "",
    "## Pages",
    `- [Home (RU)](${siteUrl}/)`,
    `- [Home (EN)](${siteUrl}/en)`,
    `- [Events (RU)](${siteUrl}/events)`,
    `- [Events (EN)](${siteUrl}/en/events)`,
    `- [Solutions](${siteUrl}/solutions)`,
    `- [Amorfa framework](${siteUrl}/amorfa)`,
    "",
    "## Upcoming events (RU)",
    ...(ruEvents.length ? ruEvents.map((event) => eventLine(event, siteUrl, "ru")) : ["- No events published."]),
    "",
    "## Upcoming events (EN)",
    ...(enEvents.length ? enEvents.map((event) => eventLine(event, siteUrl, "en")) : ["- No events published."]),
    "",
    "## Machine-readable",
    `- [Sitemap](${siteUrl}/sitemap.xml)`,
    `- [Events full text (RU)](${siteUrl}/events/llms.txt)`,
    `- [Events full text (EN)](${siteUrl}/en/events/llms.txt)`,
    `- [Events API JSON (RU)](${siteUrl}/api/v1/events?locale=ru)`,
    `- [Events API JSON (EN)](${siteUrl}/api/v1/events?locale=en)`,
    ...feedLinks,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
