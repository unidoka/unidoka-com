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
      <iframe
        src="https://calendar.google.com/calendar/embed?height=600&wkst=2&ctz=Europe%2FMoscow&showPrint=0&mode=MONTH&hl=ru&src=ZDk3NTliMDI0ZTZlY2M4YmY1YzczZjBkNTA4ZjJkNDE0ODdkMjU2ZjFmMjhlZjMyNzgxNzE4YzA0OWIwOTY1M0Bncm91cC5jYWxlbmRhci5nb29nbGUuY29t&color=%23009688"
        width="800"
        height="600"
        scrolling="no"
      />
    </>
  );
}
