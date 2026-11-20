"use client";

import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { ConsultForm } from "@/components/consult-form";
import { useLanguage } from "@/providers/language-provider";

export default function ConsultSection() {
  const { t } = useLanguage();

  const bullets = [
    t("consult.bullet_1"),
    t("consult.bullet_2"),
    t("consult.bullet_3"),
  ];

  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="mx-auto grid max-w-[960px] grid-cols-1 items-start gap-10 md:grid-cols-2 md:gap-14">
          <div className="animate-reveal fill-mode-both">
            <h2 className="mb-6 text-display-3 leading-[1.05]! tracking-tight text-(--on-bg-high) md:text-display-2">
              {t("consult.title_prefix")}{" "}
              <span className="text-(--on-bg-medium)">
                {t("consult.title_highlight")}
              </span>
              {t("consult.title_suffix")}
            </h2>
            <p className="mb-8 max-w-[420px] text-body-2 leading-relaxed text-(--on-bg-medium)">
              {t("consult.body")}
            </p>
            <ul className="space-y-3 text-body-3 text-(--on-bg-medium)">
              {bullets.map((line) => (
                <li key={line} className="flex items-center gap-3">
                  <span className="size-1.5 shrink-0 rounded-full bg-(--on-bg-high)" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <Card className="animate-reveal rounded-none border border-(--outline) bg-(--card) p-6 ring-0 fill-mode-both [animation-delay:180ms] md:p-8">
            <ConsultForm />
          </Card>
        </div>
      </Container>
    </section>
  );
}
