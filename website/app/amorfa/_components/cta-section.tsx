"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { GitBranchIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { AmorfaNest } from "@/components/icons/logotypes/amorfa-nest";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useLanguage } from "@/providers/language-provider";

const GITHUB = "https://github.com/unidoka/amorfa";

export function CtaSection() {
  const { t } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  const reduceRef = useRef(false);
  const seenRef = useRef(false);
  const [replay, setReplay] = useState(0);

  useEffect(() => {
    reduceRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  /* Below the fold on load — replay the assembly once it is actually seen. */
  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !seenRef.current) {
            seenRef.current = true;
            setReplay((n) => n + 1);
            io.disconnect();
          }
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const setVars = useCallback((dx: number, dy: number) => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--nest-dx", dx.toFixed(3));
    el.style.setProperty("--nest-dy", dy.toFixed(3));
  }, []);

  const handleMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (reduceRef.current || e.pointerType === "touch") return;
      const el = cardRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      setVars(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        ((e.clientY - r.top) / r.height) * 2 - 1,
      );
    },
    [setVars],
  );

  const handleLeave = useCallback(() => setVars(0, 0), [setVars]);

  return (
    <section className="py-24 md:py-32">
      <Container >
        <div
          ref={cardRef}
          onPointerMove={handleMove}
          onPointerLeave={handleLeave}
          className="relative overflow-hidden rounded-none border border-(--outline) bg-(--card)"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
            {/* ── Copy ─────────────────────────────────────────────── */}
            <div className="order-last flex flex-col justify-center gap-8 p-8 md:gap-10 md:p-12 lg:order-first lg:p-16">
              <h2 className="text-display-3 leading-[1.05]! tracking-tight text-balance text-(--on-bg-high) md:text-display-2">
                <span className="block">{t("amorfa.cta_title_1")}</span>
                <span className="block text-(--on-bg-medium)">
                  {t("amorfa.cta_title_2")}
                </span>
              </h2>

              <div className="flex flex-col gap-5">
                <div>
                  <Button
                    size="large"

                    asChild
                    className="md:h-16 md:px-10 md:text-heading-3!"
                  >
                    <a href={GITHUB} target="_blank" rel="noopener noreferrer">
                      <GitBranchIcon />
                      {t("amorfa.cta_github")}
                      <ArrowUpRightIcon />
                    </a>
                  </Button>
                </div>
                <p className="text-body-5 tracking-[0.06em] text-(--on-bg-low)">
                  github.com/unidoka/amorfa
                </p>
              </div>
            </div>

            {/* ── Nest plate ───────────────────────────────────────── */}
            <div className="relative order-first h-80 overflow-hidden sm:h-96 lg:order-last lg:h-auto lg:min-h-[480px]">
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Previous mark scale restored. The plate is sized so this
                    box always clears every edge — the mark is never cut. */}
                <div className="aspect-square w-[70%] max-w-[400px]">
                  <AmorfaNest key={replay} />
                </div>
              </div>

              {/* Click the plate to replay the nesting. */}
              <button
                type="button"
                onClick={() => setReplay((n) => n + 1)}
                aria-label={t("amorfa.hero_replay")}
                title={t("amorfa.hero_replay")}
                className="absolute inset-0 z-10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--primary)/40"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default CtaSection;
