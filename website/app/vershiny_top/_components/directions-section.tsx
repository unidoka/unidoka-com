"use client";

import { Briefcase, Code, Cpu, Palette } from "@phosphor-icons/react";
import { Container } from "@/components/ui/container";
import { useLanguage } from "@/providers/language-provider";

const DIRECTIONS = [
  {
    icon: Code,
    titleKey: "vershiny.direction_software_title",
    bodyKey: "vershiny.direction_software_body",
  },
  {
    icon: Briefcase,
    titleKey: "vershiny.direction_business_title",
    bodyKey: "vershiny.direction_business_body",
  },
  {
    icon: Palette,
    titleKey: "vershiny.direction_design_title",
    bodyKey: "vershiny.direction_design_body",
  },
  {
    icon: Cpu,
    titleKey: "vershiny.direction_hardware_title",
    bodyKey: "vershiny.direction_hardware_body",
  },
] as const;

export function DirectionsSection() {
  const { t } = useLanguage();

  return (
    <section className="border-b border-(--outline) py-20 md:py-28">
      <Container variant="full-width">
        <div className="mb-14 max-w-2xl">
          <h2 className="mb-4 text-display-3 leading-[1.05] md:text-display-2">
            {t("vershiny.directions_title")}
          </h2>
          <p className="text-body-2 leading-relaxed text-(--on-bg-medium)">
            {t("vershiny.directions_subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden border border-(--outline) bg-(--outline) sm:grid-cols-2 lg:grid-cols-4">
          {DIRECTIONS.map((d) => {
            const Icon = d.icon;
            return (
              <article
                key={d.titleKey}
                className="group flex flex-col gap-5 bg-(--bg) p-8 transition-colors duration-300 hover:bg-(--card)"
              >
                <span className="flex size-12 items-center justify-center rounded-2xl bg-(--on-bg-high) text-(--bg) transition-transform duration-300 group-hover:-translate-y-1">
                  <Icon className="size-5" weight="bold" />
                </span>
                <h3 className="text-heading-2 leading-tight text-(--on-bg-high)">
                  {t(d.titleKey)}
                </h3>
                <p className="text-body-3 leading-relaxed text-(--on-bg-medium)">
                  {t(d.bodyKey)}
                </p>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
