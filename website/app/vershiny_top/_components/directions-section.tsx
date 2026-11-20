"use client";

import { ArrowUpRight, Briefcase, Code, Cpu, Palette } from "@phosphor-icons/react";
import { Container } from "@/components/ui/container";
import { MarkerUnderline, DoodleArrow, DoodleStar } from "@/components/icons";
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
    <section className="py-16 md:py-24">
      <Container>
        <div className="relative mb-12 max-w-2xl">
          <h2 className="mb-4 text-display-3 leading-[1.05]! md:text-display-2">
            <span className="relative inline-block">
              {t("vershiny.directions_title")}
            </span>
          </h2>
          <p className="text-body-2 leading-relaxed text-(--on-bg-medium)">
            {t("vershiny.directions_subtitle")}
          </p>
          <DoodleArrow className="absolute -right-16 top-0 hidden h-9 w-14 rotate-12 lg:block" />
          <DoodleStar className="absolute -top-7 right-2 size-6 -rotate-6 md:-right-8 md:size-7" />
        </div>

        <div className="grid grid-cols-1 gap-px border border-(--outline) bg-(--outline) sm:grid-cols-2 lg:grid-cols-4">
          {DIRECTIONS.map((d) => {
            const Icon = d.icon;
            return (
              <article
                key={d.titleKey}
                className="group relative flex min-h-[320px] flex-col bg-(--bg) p-7 transition-colors duration-300 hover:bg-(--card)"
              >
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-[2px] w-0 bg-(--primary) transition-all duration-500 group-hover:w-full"
                />

                <div className="flex items-start justify-between gap-4">
                  <span className="flex size-12 items-center justify-center border border-(--outline) bg-(--card) text-(--on-bg-high) transition-colors duration-300 group-hover:border-(--on-bg-high) group-hover:bg-(--on-bg-high) group-hover:text-(--bg)">
                    <Icon className="size-5" weight="bold" />
                  </span>
                  <ArrowUpRight className="size-4 text-(--on-bg-low) transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>

                <div className="mt-auto pt-10">
                  <h3 className="text-heading-2 leading-tight text-(--on-bg-high)">
                    {t(d.titleKey)}
                  </h3>
                  <p className="mt-3 text-body-3 leading-relaxed text-(--on-bg-medium)">
                    {t(d.bodyKey)}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export default DirectionsSection;
