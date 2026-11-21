"use client";
import { useState } from "react";
import { GitBranchIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { AnimatedAmorfaLogo } from "@/components/icons/logotypes/animated-amorfa-logo";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";
const GITHUB = "https://github.com/unidoka/amorfa";
/**
* Anthropic-style hero: dotted grid, title top-left, mark center-bottom.
* Colors and fonts unchanged — only positioning and the grid background.
*/
export function HeroSection() {
  const { t } = useLanguage();
  const [replay, setReplay] = useState(0);
  return (
    <section className="relative overflow-hidden pt-20 pb-10 md:pt-24 md:pb-14">
      {/* Dotted grid background — covers the whole hero. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, color-mix(in srgb, var(--on-bg-low), transparent 70%) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      {/* Soft radial light spot behind the mark — keeps depth without color. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 45% at 50% 72%, color-mix(in srgb, var(--on-bg-high), transparent 94%), transparent 70%)",
        }}
      />
      {/* Title block — top-left, generous whitespace. */}
      <Container className="relative z-10 pt-12 md:pt-20 lg:pt-24">
        <h1 className="animate-reveal fill-mode-both text-(--on-bg-high)">
          <span className="flex items-center gap-[0.15em]">
            <AnimatedAmorfaLogo className="hidden sm:block size-[4rem] md:size-[6rem]" />
            <span className="text-[2.49rem] text-display-4 sm:text-display-2 md:text-display-1 lg:text-display-0 ">{t("amorfa.hero_title_1")}</span>
          </span>
          <span className="flex items-center gap-[0.25em] mt-2 sm:mt-4">
            <span className="text-[2.49rem] text-display-4 sm:text-display-2 md:text-display-1 lg:text-display-0 text-(--on-bg-medium)">{t("amorfa.hero_title_2")}</span>
            <AnimatedAmorfaLogo className="sm:hidden size-[3rem]" />
          </span>
        </h1>
        <p className="mt-3 animate-reveal fill-mode-both text-body-2 leading-relaxed text-(--on-bg-medium) [animation-delay:150ms] md:text-body-1 lg:text-[2rem]">
          {t("amorfa.description")}
        </p>
        <div className="mt-8 animate-reveal fill-mode-both [animation-delay:280ms] md:mt-10">
          <Button size="large" asChild>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer">
              <GitBranchIcon />
              {t("amorfa.cta_github")}
              <ArrowUpRightIcon />
            </a>
          </Button>
        </div>
      </Container>
      {/* Mark — center-bottom, large. Replays on click.
      <div className="relative z-10 flex items-center justify-center mt-16 md:mt-24 lg:mt-32">
        <button
          type="button"
          onClick={() => setReplay((n) => n + 1)}
          aria-label={t("amorfa.hero_replay")}
          title={t("amorfa.hero_replay")}
          className="relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--primary)/40 rounded-full"
        >
          <AnimatedAmorfaLogo
            replayKey={replay}
            className="size-48 md:size-72 lg:size-96 text-(--on-bg-high)"
          />
        </button>
      </div> */}
    </section>
  );
}
export default HeroSection;
