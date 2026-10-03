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
    <section className="py-20 md:py-28 bg-(--bg) border-t border-(--outline)">
      <Container>
        <div className="max-w-[960px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-start">
          <div className="animate-reveal">
            <p className="text-body-5 uppercase tracking-[0.32em] text-(--on-bg-low) mb-5">
              {t("consult.eyebrow")}
            </p>
            <h2 className="font-heading font-semibold tracking-[-0.03em] text-[2.5rem] md:text-[3.25rem] leading-[1.02] mb-6 text-(--on-bg-high)">
              {t("consult.title_prefix")}{" "}
              <span className="text-(--primary)">
                {t("consult.title_highlight")}
              </span>
              {t("consult.title_suffix")}
            </h2>
            <p className="text-body-2 text-(--on-bg-medium) leading-relaxed mb-8 max-w-[420px]">
              {t("consult.body")}
            </p>
            <ul className="space-y-3 text-body-4 text-(--on-bg-medium)">
              {bullets.map((line) => (
                <li key={line} className="flex items-center gap-3">
                  <span className="size-1.5 rounded-full bg-(--primary) shrink-0" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <Card className="rounded-3xl border-(--outline) bg-(--card) ring-0 p-6 md:p-8 animate-reveal [animation-delay:200ms] fill-mode-both">
            <ConsultForm />
          </Card>
        </div>
      </Container>
    </section>
  );
}
