"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  GitBranchIcon,
  ArrowUpRightIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";
import { AmorfaLogo } from "@/components/icons/logotypes/amorfa-logo";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/language-provider";

const GITHUB = "https://github.com/unidoka/amorfa";

export function HeroSection() {
  const { t } = useLanguage();
  const [replay, setReplay] = useState(0);

  return (
    <section className="relative flex min-h-[82vh] items-center justify-center overflow-hidden border-b border-(--outline) bg-(--bg) px-4 pt-28 pb-16 md:pt-32">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-16 lg:flex-row lg:gap-8">
        <div className="flex w-full flex-1 flex-col items-start gap-6">
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-(--on-bg-high) lg:text-6xl">
            <span className="mb-6 flex items-center gap-3 lg:hidden">
              <AmorfaLogo className="size-10 text-(--on-bg-high)" />
              <span className="text-2xl font-semibold tracking-tight">
                Amorfa
              </span>
            </span>
            {t("amorfa.title_1")}
            <br />
            <span className="text-(--on-bg-medium)">{t("amorfa.title_2")}</span>
          </h1>

          <p className="max-w-md text-lg leading-relaxed text-(--on-bg-medium)">
            {t("amorfa.description")}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Button size="large" shape="round" asChild>
              <a href={GITHUB} target="_blank" rel="noopener noreferrer">
                <GitBranchIcon />
                {t("amorfa.cta_github")}
                <ArrowUpRightIcon />
              </a>
            </Button>
            <Button size="large" variant="outlined" shape="round" asChild>
              <Link href="#quickstart">
                {t("amorfa.cta_quickstart")}
                <ArrowRightIcon />
              </Link>
            </Button>
            <button
              type="button"
              onClick={() => setReplay((n) => n + 1)}
              className="text-sm font-medium text-(--on-bg-low) transition-colors hover:text-(--on-bg-high)"
            >
              {t("amorfa.hero_replay")}
            </button>
          </div>
        </div>

        <div className="relative hidden w-full flex-1 items-center justify-end lg:flex">
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-8 size-[380px] -translate-y-1/2 rounded-full bg-(--primary-glass) blur-3xl"
          />
          <motion.div
            key={replay}
            initial={{ opacity: 0, scale: 0.92, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <AmorfaLogo className="size-44 text-(--on-bg-high) xl:size-56" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
