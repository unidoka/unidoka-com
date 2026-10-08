"use client";

import type { CustomSolutionPageProps } from "./solution-custom-pages";

/**
 * Example custom solution page. Copy this file and adjust to build a
 * bespoke layout for a specific solution. Register it in
 * `solution-custom-pages.tsx` and add a matching entry to
 * `solution-custom-pages-meta.ts` so it shows up in the admin editor.
 */
export function NashDevPage({ solution }: CustomSolutionPageProps) {
  return (
    <div className="min-h-screen bg-(--bg)">
      <section className="pt-32 pb-16 border-b border-(--outline)">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-body-5 uppercase tracking-[0.3em] text-(--on-bg-low) mb-4">
            {solution.category ?? "Custom page"}
          </p>
          <h1 className="text-display-1 md:text-display-0 font-heading font-medium tracking-tight text-(--on-bg-high) leading-[0.95] mb-6">
            {solution.title}
          </h1>
          {solution.short_description && (
            <p className="text-body-1 text-(--on-bg-medium) max-w-2xl">
              {solution.short_description}
            </p>
          )}
        </div>
      </section>
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-body-3 text-(--on-bg-medium)">
            Это кастомная страница для решения «{solution.title}».
            Замените содержимое этого файла на свой дизайн.
          </p>
        </div>
      </section>
    </div>
  );
}
