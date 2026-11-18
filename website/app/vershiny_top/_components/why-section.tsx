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
    <section className="border-b border-(--outline) py-20 md:py-28">
      <Container variant="full-width">
        <div className="mb-14 grid grid-cols-1 items-end gap-8 lg:grid-cols-2 lg:gap-16">
          <h2 className="text-display-3 leading-[1.05] md:text-display-2">
            {t("vershiny.why_title")}
          </h2>
          <p className="max-w-[520px] text-body-2 leading-relaxed text-(--on-bg-medium) lg:pb-2">
            {t("vershiny.why_subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((c) => (
            <article
              key={c.titleKey}
              className="group flex flex-col gap-4 bg-(--bg) p-4 transition-colors duration-300 hover:bg-(--card) md:p-6"
            >
              <h3 className="text-heading-2 leading-tight text-(--on-bg-high)">
                {t(c.titleKey)}
              </h3>
              <p className="text-body-3 leading-relaxed text-(--on-bg-medium)">
                {t(c.bodyKey)}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
