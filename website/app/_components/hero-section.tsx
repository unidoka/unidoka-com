"use client";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/utils/constants/routes";
import {
  CodeIcon,
  DiamondIcon,
  SignatureIcon,
  FilmStripIcon,
  MegaphoneIcon,
  SparkleIcon,
  ArrowUpRightIcon,
  LightbulbIcon,
} from "@phosphor-icons/react";
import { useLanguage } from "@/providers/language-provider";
import { ConsultDialog } from "@/components/consult-dialog";
const SERVICES = [
  { key: "services.development", Icon: CodeIcon },
  { key: "services.motion", Icon: DiamondIcon },
  { key: "services.branding", Icon: SignatureIcon },
  { key: "services.promotion", Icon: MegaphoneIcon },
  { key: "services.we_do", Icon: FilmStripIcon },
  { key: "services.avg_label", Icon: SparkleIcon },
];
const MARQUEE_WORDS = [
  "САЙТЫ", "ПРИЛОЖЕНИЯ", "3D-МОДЕЛИ", "ВИДЕО",
  "БРЕНДИНГ", "АЙДЕНТИКА", "SEO", "MINI APPS",
  "ЛОГОТИПЫ", "ПРОДВИЖЕНИЕ", "МОУШН", "CGI",
];
export default function HeroSection() {
  const { t } = useLanguage();
  const marquee = [...MARQUEE_WORDS, ...MARQUEE_WORDS];
  return (
    <section className="relative overflow-hidden bg-(--bg) text-(--on-bg-high)">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--on-bg-high) 1px, transparent 1px), linear-gradient(to bottom, var(--on-bg-high) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 25% 30%, black 30%, transparent 95%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 25% 30%, black 30%, transparent 95%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 45% 55% at 12% 15%, var(--primary-glass), transparent 65%)",
        }}
      />
      <Container className="relative pt-28 sm:pt-36 pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-7 animate-reveal">
            <p className="text-body-5 uppercase tracking-[0.32em] text-(--on-bg-low) mb-6">
              Rovno.dev · {new Date().getFullYear()}
            </p>
            <h1 className="font-heading font-semibold tracking-[-0.035em] leading-[0.95] text-[2.75rem] sm:text-[4rem] lg:text-[5.25rem] mb-8">
              {t("hero.title.part1")}{" "}
              <span className="text-(--primary)">{t("hero.title.part2")}</span>
            </h1>
            <p className="text-body-2 md:text-body-1 text-(--on-bg-medium) leading-relaxed max-w-[520px] mb-10">
              Дизайн, разработка, 3D и продакшн — в одной команде. Собираем
              продукты, к которым хочется вернуться.
            </p>
            <div className="flex flex-wrap gap-3">
              <ConsultDialog>
                <Button size="large" shape="round">
                  <LightbulbIcon className="size-4" />
                  {t("nav.request")}
                </Button>
              </ConsultDialog>
              <Button size="large" variant="outlined" shape="round" asChild>
                <Link href={ROUTES.projects.href}>
                  {t("projects.title")}
                  <ArrowUpRightIcon className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="lg:col-span-5 animate-reveal [animation-delay:200ms] fill-mode-both">
            <div className="grid grid-cols-2 gap-px bg-(--outline) border border-(--outline) rounded-3xl overflow-hidden">
              {SERVICES.map(({ key, Icon }) => (
                <div
                  key={key}
                  className="group flex flex-col gap-3 bg-(--bg) p-5 min-h-[120px] transition-colors hover:bg-(--card)"
                >
                  <Icon className="size-6 text-(--primary)" weight="duotone" />
                  <span className="text-body-4 text-(--on-bg-high) font-medium leading-tight">
                    {t(key)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="relative mt-16 sm:mt-20 border-y border-(--outline) py-5 overflow-hidden select-none">
          <div className="flex whitespace-nowrap animate-marquee w-max">
            <div className="flex shrink-0 items-center gap-8 pr-8">
              {marquee.map((word, i) => (
                <span
                  key={i}
                  className="font-mono uppercase text-xl sm:text-2xl tracking-tight text-(--on-bg-medium)"
                >
                  {word}
                  <span className="mx-4 text-(--primary)">·</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </Container>
      <div className="h-12 sm:h-16" />
    </section>
  );
}
