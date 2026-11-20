"use client";

import { Container } from "@/components/ui/container";
import { useLanguage } from "@/providers/language-provider";

const STACK = [
  "Python 3.12",
  "FastAPI",
  "SQLAlchemy 2.0",
  "Alembic",
  "PostgreSQL 15",
  "Valkey / Redis",
  "Next.js 16",
  "React 19",
  "Tailwind CSS v4",
  "TypeScript",
  "Docker",
  "Traefik",
] as const;

/**
 * The stack reads as one sentence, not a grid. Names wrap on the natural
 * line, separated by a hairline middot; the only motion is each name
 * lifting to full contrast under the pointer. No cells, no borders, no
 * columns - nothing that turns a list of twelve words into a table.
 */
export function StackSection() {
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-24">
      <Container>
        <h2 className="mb-10 text-display-3 leading-[1.05]! md:text-display-2">
          {t("amorfa.stack_title")}
        </h2>

        <ul className="flex max-w-4xl flex-wrap items-baseline gap-x-3 gap-y-1 text-heading-2 leading-[1.6] text-(--on-bg-medium) md:text-heading-1">
          {STACK.map((name, i) => (
            <li key={name} className="inline-flex items-baseline gap-3">
              <span className="transition-colors duration-300 hover:text-(--on-bg-high)">
                {name}
              </span>
              {i < STACK.length - 1 && (
                <span aria-hidden className="text-(--on-bg-low) opacity-50">
                  ·
                </span>
              )}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export default StackSection;
