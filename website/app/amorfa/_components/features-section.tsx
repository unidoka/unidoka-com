"use client";

import {
  LightningIcon,
  RobotIcon,
  StackIcon,
  PackageIcon,
  GitBranchIcon,
  CodeIcon,
  BracketsCurly,
  CloudArrowUp,
} from "@phosphor-icons/react";
import { Container } from "@/components/ui/container";
import { DoodleSpark, DoodleLoop } from "@/components/icons";
import { useLanguage } from "@/providers/language-provider";

const FEATURES = [
  { icon: LightningIcon, titleKey: "amorfa.feature_1_title", bodyKey: "amorfa.feature_1_body" },
  { icon: RobotIcon, titleKey: "amorfa.feature_2_title", bodyKey: "amorfa.feature_2_body" },
  { icon: StackIcon, titleKey: "amorfa.feature_3_title", bodyKey: "amorfa.feature_3_body" },
  { icon: PackageIcon, titleKey: "amorfa.feature_4_title", bodyKey: "amorfa.feature_4_body" },
  { icon: GitBranchIcon, titleKey: "amorfa.feature_5_title", bodyKey: "amorfa.feature_5_body" },
  { icon: CodeIcon, titleKey: "amorfa.feature_6_title", bodyKey: "amorfa.feature_6_body" },
  { icon: BracketsCurly, titleKey: "amorfa.feature_7_title", bodyKey: "amorfa.feature_7_body" },
  { icon: CloudArrowUp, titleKey: "amorfa.feature_8_title", bodyKey: "amorfa.feature_8_body" },
] as const;

export function FeaturesSection() {
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-24">
      <Container >
        <div className="relative mb-12 max-w-2xl">
          <h2 className="text-display-3 leading-[1.05]! md:text-display-2">
            <span className="relative inline-block">
              {t("amorfa.features_title")}
            </span>
          </h2>
          <DoodleSpark
            className="absolute -top-6 right-0 size-6 rotate-12 md:-right-9 md:size-8"
          />
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-none border border-(--outline) bg-(--outline) sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <article
                key={f.titleKey}
                className="group flex flex-col gap-5 bg-(--bg) p-8 transition-colors duration-300 hover:bg-(--card)"
              >
                <span className="flex size-12 items-center justify-center rounded-none bg-(--on-bg-high) text-(--bg) transition-transform duration-300 group-hover:-translate-y-1">
                  <Icon className="size-5" weight="bold" />
                </span>
                <h3 className="text-heading-3 leading-tight text-(--on-bg-high)">
                  {t(f.titleKey)}
                </h3>
                <p className="text-body-3 leading-relaxed text-(--on-bg-medium)">
                  {t(f.bodyKey)}
                </p>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export default FeaturesSection;
