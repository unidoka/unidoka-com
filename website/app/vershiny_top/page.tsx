import type { Metadata } from "next";
import { getLocale } from "@/i18n/server";
import { ScrollReveal } from "@/components/layout/animation/scroll-reveal";
import { HeroSection } from "./_components/hero-section";
import { WhySection } from "./_components/why-section";
import { MentorsSection } from "./_components/mentors-section";
import { DirectionsSection } from "./_components/directions-section";
import { EventsSection } from "./_components/events-section";
import { CtaSection } from "./_components/cta-section";

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
  const canonical = `${siteUrl}${isEn ? "/en/vershiny_top" : "/vershiny_top"}`;
  const title = isEn
    ? "Vershiny — a community of future creators"
    : "Вершины — сообщество создателей будущего";
  const description = isEn
    ? "Mentorship, internships and real projects for people who want to build the future."
    : "Менторство, стажировки и реальные проекты для тех, кто хочет создавать будущее.";

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ru: `${siteUrl}/vershiny_top`,
        en: `${siteUrl}/en/vershiny_top`,
        "x-default": `${siteUrl}/vershiny_top`,
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
      images: [{ url: `${siteUrl}/og.jpg`, alt: "Vershiny" }],
    },
    other: { "content-language": isEn ? "en" : "ru" },
  };
}

export default function VershinyTopPage() {
  return (
    <div className="min-h-screen bg-(--bg)">
      <HeroSection />
      <ScrollReveal threshold={0.05}>
        <WhySection />
      </ScrollReveal>
      <ScrollReveal threshold={0.05}>
        <MentorsSection />
      </ScrollReveal>
      <ScrollReveal threshold={0.05}>
        <DirectionsSection />
      </ScrollReveal>
      <ScrollReveal threshold={0.05}>
        <EventsSection />
      </ScrollReveal>
      <ScrollReveal threshold={0.05}>
        <CtaSection />
      </ScrollReveal>
    </div>
  );
}
