"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { GitBranchIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { AnimatedAmorfaLogo } from "@/components/icons/logotypes/animated-amorfa-logo";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useLanguage } from "@/providers/language-provider";

const GITHUB = "https://github.com/unidoka/amorfa";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

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

  /* The block sits below the fold, so its entrance would otherwise finish
     before anyone sees it. Replay once when it actually enters the viewport. */
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
    el.style.setProperty("--cta-dx", dx.toFixed(3));
    el.style.setProperty("--cta-dy", dy.toFixed(3));
    el.style.setProperty("--cta-x", `${(((dx + 1) / 2) * 100).toFixed(2)}%`);
    el.style.setProperty("--cta-y", `${(((dy + 1) / 2) * 100).toFixed(2)}%`);
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
      <Container variant="full-width">
        <div
          ref={cardRef}
          onPointerMove={handleMove}
          onPointerLeave={handleLeave}
          className="relative overflow-hidden rounded-3xl border border-(--outline) bg-(--card)"
        >
          {/* Ambient field: a static corner bloom plus a soft light that
              tracks the pointer. Both are mixed from design tokens. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 70% at 88% 12%, color-mix(in srgb, var(--on-bg-high), transparent 94%), transparent 70%), radial-gradient(420px circle at var(--cta-x, 78%) var(--cta-y, 26%), color-mix(in srgb, var(--on-bg-high), transparent 91%), transparent 72%)",
              transition: `background 240ms ${EASE}`,
            }}
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
            {/* ── Copy ─────────────────────────────────────────────── */}
            <div className="order-last flex flex-col justify-center gap-8 p-8 md:gap-10 md:p-12 lg:order-first lg:p-16">
              <h2 className="text-display-3 leading-[1.05]! tracking-tight text-balance text-(--on-bg-high) md:text-display-2">
                <span className="block">{t("amorfa.cta_title_1")}</span>
                <span className="block text-(--on-bg-medium)">
                  {t("amorfa.cta_title_2")}
                </span>
              </h2>

              <div>
                <Button
                  size="large"
                  shape="round"
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
            </div>

            {/* ── Mark plate ───────────────────────────────────────── */}
            <div className="group/mark relative order-first h-64 overflow-hidden border-(--outline) sm:h-72 lg:order-last lg:h-auto lg:min-h-[440px] lg:border-l">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative aspect-square w-[58%] max-w-[380px] translate-x-[20%] -translate-y-[4%] lg:w-[74%] lg:translate-x-[18%] lg:translate-y-[12%]">
                  <div
                    className="absolute inset-0"
                    style={{
                      transform:
                        "perspective(1000px) rotateX(calc(var(--cta-dy, 0) * -3.5deg)) rotateY(calc(var(--cta-dx, 0) * 4.5deg))",
                      transition: `transform 400ms ${EASE}`,
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {/* Concentric rings — the trefoil's own geometry,
                        drawn as hairlines and cropped by the plate. */}
                    {[
                      { inset: "-16%", delay: "0s" },
                      { inset: "-34%", delay: "1.4s" },
                      { inset: "-54%", delay: "2.8s" },
                    ].map((ring) => (
                      <span
                        key={ring.inset}
                        aria-hidden
                        className="amorfa-ring pointer-events-none absolute block rounded-full border border-(--outline) opacity-60 transition-opacity duration-500 group-hover/mark:opacity-100"
                        style={{
                          inset: ring.inset,
                          animationDelay: ring.delay,
                          transform:
                            "translate3d(calc(var(--cta-dx, 0) * 8px), calc(var(--cta-dy, 0) * 6px), 0)",
                          transition: `transform 500ms ${EASE}, opacity 500ms ${EASE}`,
                        }}
                      />
                    ))}

                    {/* Ghost copy — oversized and blurred, drifting further
                        than the crisp mark so the pair reads as depth. */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute block opacity-[0.07] blur-[3px]"
                      style={{
                        inset: "-8%",
                        transform:
                          "translate3d(calc(var(--cta-dx, 0) * 26px), calc(var(--cta-dy, 0) * 22px), 0)",
                        transition: `transform 520ms ${EASE}`,
                      }}
                    >
                      <AnimatedAmorfaLogo
                        replayKey={replay}
                        delayMs={140}
                        className="size-full"
                      />
                    </span>

                    {/* Crisp mark — ambient drift on the outer wrapper,
                        pointer parallax on the inner one, so the two
                        transforms never fight over the same element. */}
                    <span className="amorfa-mark-float pointer-events-none absolute inset-0 block">
                      <span
                        className="absolute inset-0 block"
                        style={{
                          transform:
                            "translate3d(calc(var(--cta-dx, 0) * -10px), calc(var(--cta-dy, 0) * -8px), 0)",
                          transition: `transform 420ms ${EASE}`,
                        }}
                      >
                        <AnimatedAmorfaLogo
                          replayKey={replay}
                          className="size-full"
                        />
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Click the plate to replay the bloom. */}
              <button
                type="button"
                onClick={() => setReplay((n) => n + 1)}
                aria-label={t("amorfa.hero_replay")}
                title={t("amorfa.hero_replay")}
                className="absolute inset-0 z-20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--primary)/40"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default CtaSection;
