import { ScrollReveal } from "@/components/layout/animation/scroll-reveal";
import { HeroSection } from "./_components/hero-section";
import { FeaturesSection } from "./_components/features-section";
import { StructureSection } from "./_components/structure-section";
import { StackSection } from "./_components/stack-section";
import { QuickstartSection } from "./_components/quickstart-section";
import { CtaSection } from "./_components/cta-section";

export default function AmorfaPage() {
  return (
    <div className="min-h-screen bg-(--bg)">
      <HeroSection />
      <ScrollReveal threshold={0.05}>
        <FeaturesSection />
      </ScrollReveal>
      <ScrollReveal threshold={0.05}>
        <StructureSection />
      </ScrollReveal>
      <ScrollReveal threshold={0.05}>
        <StackSection />
      </ScrollReveal>
      <ScrollReveal threshold={0.05}>
        <QuickstartSection />
      </ScrollReveal>
      <ScrollReveal threshold={0.05}>
        <CtaSection />
      </ScrollReveal>
    </div>
  );
}
