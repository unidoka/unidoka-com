import type { Metadata } from "next";
import { ScrollReveal } from "@/components/layout/animation/scroll-reveal";
import { HeroSection } from "./_components/hero-section";
import { WhySection } from "./_components/why-section";
import { MentorsSection } from "./_components/mentors-section";
import { DirectionsSection } from "./_components/directions-section";
import { EventsSection } from "./_components/events-section";
import { CtaSection } from "./_components/cta-section";

export const metadata: Metadata = {
  title: "Вершины — платформа для роста в IT",
  description:
    "Менторство, стажировки и реальные проекты для тех, кто хочет расти быстрее.",
};

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
