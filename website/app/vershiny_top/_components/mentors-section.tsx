"use client";

import { CheckIcon } from "@phosphor-icons/react";
import { Container } from "@/components/ui/container";
import { useLanguage } from "@/providers/language-provider";

const POINTS = [
  "vershiny.mentors_point_1",
  "vershiny.mentors_point_2",
  "vershiny.mentors_point_3",
  "vershiny.mentors_point_4",
] as const;

export function MentorsSection() {
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-24">
      <Container >
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          <div>
            <h2 className="mb-6 text-display-3 leading-[1.05]! md:text-display-2">
              {t("vershiny.mentors_title")}
            </h2>
            <p className="max-w-[560px] text-body-2 leading-relaxed text-(--on-bg-medium)">
              {t("vershiny.mentors_body")}
            </p>
          </div>

          <ul className="">
            {POINTS.map((key) => (
              <li key={key} className="flex items-center gap-4 py-5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-(--on-bg-high) text-(--bg)">
                  <CheckIcon className="size-4" weight="bold" />
                </span>
                <span className="text-body-2 leading-snug text-(--on-bg-high)">
                  {t(key)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

export default MentorsSection;
