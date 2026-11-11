"use client";
import { ScrollReveal } from "@/components/layout/animation/scroll-reveal";
import BestWorksSection from "./_components/best-projects-section";
import NumbersSection from "./_components/numbers-section";
import HeroSection from "./_components/hero-section";
import ConsultSection from "./_components/consult-section";
export default function Home() {
  return (
    <>
      <HeroSection />
      <ScrollReveal threshold={0.05}>
        <NumbersSection />
      </ScrollReveal>
      <ScrollReveal delay={100} threshold={0.05}>
        <BestWorksSection />
      </ScrollReveal>
      <ConsultSection />
    </>
  );
}
