"use client";

import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { VershinyLogoMono } from "@/components/icons/logotypes/vershiny-logo-mono";
import { useLanguage } from "@/providers/language-provider";

const JOIN_URL = "https://t.me/+cgrvXV-BbBJmMzYy";
const CONTACT_URL = "https://t.me/niyaz_gimadiev";

const SOCIALS = [
  { label: "Telegram", href: "https://t.me/vershiny_top" },
  { label: "ВКонтакте", href: "https://vk.ru/vershiny_top" },
  { label: "Max", href: "https://max.ru/channel_vershiny_top" },
] as const;

export function CtaSection() {
  const { t } = useLanguage();

  return (
    <section className="py-24 md:py-32">
      <Container >
        <div className="relative overflow-hidden rounded-none border border-(--outline) bg-(--card) p-8 md:p-14">
          <VershinyLogoMono
            className="pointer-events-none absolute -right-8 -bottom-8 h-56 w-auto opacity-[0.1]!"
            aria-hidden
          />

          <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            <div>
              <h2 className="mb-5 text-display-3 leading-[1.05] md:text-display-2">
                {t("vershiny.cta_title")}
              </h2>
              <p className="mb-8 max-w-[520px] text-body-2 leading-relaxed text-(--on-bg-medium)">
                {t("vershiny.cta_subtitle")}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="large" asChild>
                  <a href={JOIN_URL} target="_blank" rel="noopener noreferrer">
                    {t("vershiny.cta_join")}
                    <ArrowRight />
                  </a>
                </Button>
                <Button size="large" variant="outlined" asChild>
                  <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer">
                    {t("vershiny.cta_contact")}
                    <ArrowUpRight />
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <ul>
                {SOCIALS.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-4 border-b border-(--outline) py-4 text-body-2 text-(--on-bg-high) transition-opacity hover:opacity-70"
                    >
                      <span>{s.label}</span>
                      <ArrowUpRight className="size-4 opacity-40 transition-opacity group-hover:opacity-100" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
