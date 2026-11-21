"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { AlembicLogoIcon } from "@/components/icons/logotypes/alembic-logo-icon";
import { DockerLogoIcon } from "@/components/icons/logotypes/docker-logo-icon";
import { FastApiLogoIcon } from "@/components/icons/logotypes/fastapi-logo-icon";
import { NextjsLogoIcon } from "@/components/icons/logotypes/nextjs-logo-icon";
import { PostgresqlLogoIcon } from "@/components/icons/logotypes/postgresql-logo-icon";
import { PythonLogoIcon } from "@/components/icons/logotypes/python-logo-icon";
import { ReactLogoIcon } from "@/components/icons/logotypes/react-logo-icon";
import { SqlAlchemyLogoIcon } from "@/components/icons/logotypes/sqlalchemy-logo-icon";
import { TailwindLogoIcon } from "@/components/icons/logotypes/tailwind-logo-icon";
import { TraefikLogoIcon } from "@/components/icons/logotypes/traefik-logo-icon";
import { TypescriptLogoIcon } from "@/components/icons/logotypes/typescript-logo-icon";
import { ValkeyLogoIcon } from "@/components/icons/logotypes/valkey-logo-icon";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";

const STACK = [
  { name: "Python 3.12", Icon: PythonLogoIcon },
  { name: "FastAPI", Icon: FastApiLogoIcon },
  { name: "SQLAlchemy 2.0", Icon: SqlAlchemyLogoIcon },
  { name: "Alembic", Icon: AlembicLogoIcon },
  { name: "PostgreSQL 15", Icon: PostgresqlLogoIcon },
  { name: "Valkey / Redis", Icon: ValkeyLogoIcon },
  { name: "Next.js 16", Icon: NextjsLogoIcon },
  { name: "React 19", Icon: ReactLogoIcon },
  { name: "Tailwind CSS v4", Icon: TailwindLogoIcon },
  { name: "TypeScript", Icon: TypescriptLogoIcon },
  { name: "Docker", Icon: DockerLogoIcon },
  { name: "Traefik", Icon: TraefikLogoIcon },
] as const;

const AUTO_REVEAL_MS = 2800;
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The stack reads as one sentence, not a grid. Every name carries its
 * mark in a clipped slot: on hover/focus it slides out from a shaded
 * edge and nudges the text, and while the pointer is away one random
 * item opens at a time on a slow loop.
 */
export function StackSection() {
  const { t } = useLanguage();
  const reduce = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  const interacting = useRef(false);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      if (interacting.current) return;
      setActive((prev) => {
        if (STACK.length < 2) return 0;
        let next = Math.floor(Math.random() * STACK.length);
        if (next === prev) next = (next + 1) % STACK.length;
        return next;
      });
    }, AUTO_REVEAL_MS);
    return () => window.clearInterval(id);
  }, [reduce]);

  const activate = (index: number) => {
    interacting.current = true;
    setActive(index);
  };

  const deactivate = () => {
    interacting.current = false;
    setActive(null);
  };

  return (
    <section className="py-16 md:py-24">
      <Container>
        <h2 className="mb-10 text-display-3 leading-[1.05]! md:text-display-2">
          {t("amorfa.stack_title")}
        </h2>

        <ul className="flex max-w-4xl flex-wrap items-baseline gap-x-3 gap-y-1 text-heading-2 leading-[1.6] text-(--on-bg-medium) md:text-heading-1">
          {STACK.map(({ name, Icon }, i) => {
            const isActive = active === i;
            return (
              <li key={name} className="inline-flex items-baseline gap-3">
                <span
                  onMouseEnter={() => activate(i)}
                  onMouseLeave={deactivate}
                  className={cn(
                    "inline-flex cursor-default items-center rounded-md text-(--on-bg-medium) transition-colors duration-300 hover:text-(--on-bg-high)",
                    isActive && "text-(--on-bg-high)",
                  )}
                >
                  <motion.span
                    aria-hidden
                    initial={false}
                    animate={{
                      width: isActive ? "1em" : "0em",
                      marginRight: isActive ? "0.12em" : "0em",
                      opacity: isActive ? 1 : 0,
                      x: isActive ? 0 : -6,
                    }}
                    transition={{ duration: reduce ? 0 : 0.55, ease: EASE }}
                    className="inline-flex shrink-0 items-center overflow-hidden"
                    style={{
                      maskImage:
                        "linear-gradient(90deg, transparent 0%, #000 45%)",
                      WebkitMaskImage:
                        "linear-gradient(90deg, transparent 0%, #000 45%)",
                    }}
                  >
                    <Icon className="size-[0.98em] shrink-0" />
                  </motion.span>

                  <motion.span
                    animate={{ x: isActive ? 2 : 0 }}
                    transition={{ duration: reduce ? 0 : 0.55, ease: EASE }}
                    className="whitespace-nowrap"
                  >
                    {name}
                  </motion.span>
                </span>
                {i < STACK.length - 1 && (
                  <span aria-hidden className="text-(--on-bg-low) opacity-50">
                    ·
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

export default StackSection;
