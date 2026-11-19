"use client";

import { Container } from "@/components/ui/container";
import { useLanguage } from "@/providers/language-provider";

const CARDS = [
  { titleKey: "vershiny.why_1_title", bodyKey: "vershiny.why_1_body" },
  { titleKey: "vershiny.why_2_title", bodyKey: "vershiny.why_2_body" },
  { titleKey: "vershiny.why_3_title", bodyKey: "vershiny.why_3_body" },
  { titleKey: "vershiny.why_4_title", bodyKey: "vershiny.why_4_body" },
] as const;

export function WhySection() {
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-24">
      <Container >
        <div className="mb-12 grid grid-cols-1 items-end gap-8 lg:grid-cols-2 lg:gap-16">
          <h2 className="text-display-3 leading-[1.05]! md:text-display-2">
            {t("vershiny.why_title")}
          </h2>
          <p className="max-w-[520px] text-body-2 leading-relaxed text-(--on-bg-medium) lg:pb-2">
            {t("vershiny.why_subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((c) => (
            <article
              key={c.titleKey}
              className="group relative flex min-h-[240px] flex-col overflow-hidden rounded-3xl border border-(--outline) bg-(--card) p-7 transition-all duration-500 hover:-translate-y-1 hover:border-(--on-bg-low) hover:shadow-[0_24px_60px_-40px_rgba(0,0,0,0.5)] md:p-8"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -top-20 -right-20 size-52 rounded-full bg-(--primary-glass) opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
              />
              <span className="relative mb-8 h-px w-10 bg-(--on-bg-high) opacity-20 transition-all duration-500 group-hover:w-16 group-hover:opacity-60" />
              <h3 className="relative text-heading-2 leading-tight text-(--on-bg-high)">
                {t(c.titleKey)}
              </h3>
              <p className="relative mt-3 text-body-3 leading-relaxed text-(--on-bg-medium)">
                {t(c.bodyKey)}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default WhySection;
