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
  const canonical = `${siteUrl}${isEn ? "/en/solutions" : "/solutions"}`;
  const title = isEn ? "Solutions" : "Решения";
  const description = isEn
    ? "Projects, open-source solutions, new ways of organizing and business communities created by Unidoka."
    : "То, что создаёт будущее - open source решения, новые способы организации, бизнес-сообщества и многое другое.";

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ru: `${siteUrl}/solutions`,
        en: `${siteUrl}/en/solutions`,
        "x-default": `${siteUrl}/solutions`,
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
      images: [{ url: `${siteUrl}/og.jpg`, alt: "Unidoka" }],
    },
    other: { "content-language": isEn ? "en" : "ru" },
  };
}

export default function SolutionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
