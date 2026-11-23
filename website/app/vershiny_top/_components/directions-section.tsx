"use client";

import { Container } from "@/components/ui/container";
import { SoftwareSpecialIcon } from "@/components/icons/special/software-special-icon";
import { BusinessSpecialIcon } from "@/components/icons/special/business-special-icon";
import { DesignSpecialIcon } from "@/components/icons/special/design-special-icon";
import { HardwareSpecialIcon } from "@/components/icons/special/hardware-special-icon";
import { useLanguage } from "@/providers/language-provider";

const DIRECTIONS = [
  {
    icon: SoftwareSpecialIcon,
    titleKey: "vershiny.direction_software_title",
    bodyKey: "vershiny.direction_software_body",
  },
  {
    icon: BusinessSpecialIcon,
    titleKey: "vershiny.direction_business_title",
    bodyKey: "vershiny.direction_business_body",
  },
  {
    icon: DesignSpecialIcon,
    titleKey: "vershiny.direction_design_title",
    bodyKey: "vershiny.direction_design_body",
  },
  {
    icon: HardwareSpecialIcon,
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
            {t("vershiny.directions_title")}
          </h2>
          <p className="text-body-2 leading-relaxed text-(--on-bg-medium)">
            {t("vershiny.directions_subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px border border-(--outline) bg-(--outline) sm:grid-cols-2 lg:grid-cols-4">
          {DIRECTIONS.map((d) => {
            const Icon = d.icon;
            return (
              <article
                key={d.titleKey}
                className="group relative flex min-h-[260px] flex-col bg-(--bg) p-7 transition-colors duration-300 hover:bg-(--card)"
              >
                <Icon
                  aria-hidden
                  className="size-12 shrink-0 text-(--on-bg-high) transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-[1.04] lg:size-14"
                />

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
