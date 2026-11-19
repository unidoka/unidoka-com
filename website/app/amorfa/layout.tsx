import type { Metadata } from "next";
import { getLocale } from "@/i18n/server";

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
  const canonical = `${siteUrl}${isEn ? "/en/amorfa" : "/amorfa"}`;

  const title = isEn
    ? "Amorfa — AI-optimized fullstack framework"
    : "Amorfa — AI-optimized fullstack framework";
  const description = isEn
    ? "Amorfa is an open-source fullstack framework for building apps in hours. FastAPI + Next.js + PostgreSQL, ready to ship, AI-friendly."
    : "Amorfa — open-source fullstack framework для создания приложений за часы. FastAPI + Next.js + PostgreSQL, готов к продакшену, AI-friendly.";

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ru: `${siteUrl}/amorfa`,
        en: `${siteUrl}/en/amorfa`,
        "x-default": `${siteUrl}/amorfa`,
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      locale: isEn ? "en_US" : "ru_RU",
      alternateLocale: isEn ? ["ru_RU"] : ["en_US"],
      siteName: "Unidoka",
      images: [{ url: `${siteUrl}/og.jpg`, alt: "Amorfa" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/og.jpg`],
    },
    other: { "content-language": isEn ? "en" : "ru" },
  };
}

export default function AmorfaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
