import type { Metadata } from "next";
import { headers } from "next/headers";
import EventsClientLayout from "./client-layout";
import { getLocale } from "@/i18n/server";
import { fetchIcalFeedsServer } from "@/utils/api/events";

function siteOrigin(): string {
  const proto = process.env.NEXT_PUBLIC_HTTP_PROTOCOL || "https";
  const rawRoot = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "").trim();
  const cleanRoot = rawRoot.replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
  return cleanRoot ? `${proto}://${cleanRoot}` : "http://localhost:3000";
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isEn = locale === "en";
  const siteUrl = siteOrigin();
  const canonical = `${siteUrl}${isEn ? "/en/events" : "/events"}`;
  const icalUrl = await fetchIcalFeedsServer(locale).then(
    (feeds) => feeds.activities ?? feeds.competitions,
  );

  const title = isEn ? "Events" : "События";
  const description = isEn
    ? "Unidoka events calendar: conferences, forums, hackathons, meetups and internships. Subscribe to the calendar so you never miss a date."
    : "Календарь событий Unidoka: конференции, форумы, хакатоны, митапы и стажировки. Подпишитесь на календарь, чтобы не пропустить.";
  const ogImage = `${siteUrl}/api/og?${new URLSearchParams({
    title: isEn ? "Unidoka events" : "События Unidoka",
    subtitle: description,
    label: "Events",
  }).toString()}`;

  return {
    title,
    description,
    keywords: isEn
      ? ["events", "activities", "competitions", "conference", "forum", "hackathon", "meetup", "internship", "Unidoka"]
      : ["события", "мероприятия", "соревнования", "конференции", "форумы", "хакатоны", "митапы", "стажировки", "Unidoka"],
    alternates: {
      canonical,
      languages: {
        ru: `${siteUrl}/events`,
        en: `${siteUrl}/en/events`,
        "x-default": `${siteUrl}/events`,
      },
      types: {
        ...(icalUrl ? { "text/calendar": icalUrl } : {}),
        "text/plain": `${siteUrl}${isEn ? "/en" : ""}/events/llms.txt`,
        "application/json": `${siteUrl}/api/v1/events?locale=${locale}`,
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      title: isEn ? "Events - Unidoka" : "События - Unidoka",
      description,
      locale: isEn ? "en_US" : "ru_RU",
      alternateLocale: isEn ? ["ru_RU"] : ["en_US"],
      images: [{ url: ogImage, alt: isEn ? "Unidoka events" : "События Unidoka" }],
    },
    twitter: {
      card: "summary_large_image",
      title: isEn ? "Events - Unidoka" : "События - Unidoka",
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    other: { "content-language": isEn ? "en" : "ru" },
  };
}

export default async function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const host = (h.get("host") || "").split(":")[0];
  const isEventsHost = host.startsWith("events.");
  return (
    <EventsClientLayout isEventsHost={isEventsHost}>
      {children}
    </EventsClientLayout>
  );
}
