import type { Metadata } from "next";
import { ScrollReveal } from "@/components/layout/animation/scroll-reveal";
import { getLocale } from "@/i18n/server";
import { getLogoAscii } from "@/lib/logo-ascii";
import HeroSection from "./_components/hero-section";
import NumbersSection from "./_components/numbers-section";
import BestWorksSection from "./_components/best-projects-section";
import ConsultSection from "./_components/consult-section";

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
  const canonical = `${siteUrl}${isEn ? "/en" : ""}`;
  const title = isEn ? "Unidoka — better together" : "Unidoka: вместе — лучше";
  const description = isEn
    ? "Unidoka builds future solutions and develops specialists and creators — conferences, events, open-source projects and the Amorfa framework."
    : "Создание решений будущего и развитие специалистов и созидателей уже сегодня.";

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ru: siteUrl,
        en: `${siteUrl}/en`,
        "x-default": siteUrl,
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
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/og.jpg`],
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

export default function Home() {
  return (
    <>
      <HeroSection ascii={getLogoAscii()} />
      <ScrollReveal threshold={0.05}>
        <NumbersSection />
      </ScrollReveal>
      {/* <ScrollReveal delay={100} threshold={0.05}>
        <BestWorksSection />
      </ScrollReveal> */}
      <ConsultSection />
    </>
  );
}
