"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { Container } from "@/components/ui/container";
import { VershinyLogoIcon } from "@/components/icons/logotypes/vershiny-logo-icon";
import { useLanguage } from "@/providers/language-provider";

const POINTS = [
  "vershiny.mentors_point_1",
  "vershiny.mentors_point_2",
  "vershiny.mentors_point_3",
  "vershiny.mentors_point_4",
] as const;

/* The water rises bottom-up: point 1 is the base, point 4 the whole mark. */
const FILL_LEVELS = [28, 52, 76, 100];

const CYCLE_MS = 5000;

export function MentorsSection() {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const fill = useMotionValue(0);
  const clipPath = useTransform(fill, (value) => `inset(${100 - value}% 0% 0% 0%)`);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      fill.set(FILL_LEVELS[active]);
      return;
    }
    const controls = animate(fill, FILL_LEVELS[active], {
      type: "spring",
      stiffness: 120,
      damping: 14,
      mass: 0.7,
    });
    return () => controls.stop();
  }, [active, fill, reduceMotion]);

  useEffect(() => {
    if (paused || reduceMotion) return;
    const id = window.setTimeout(
      () => setActive((active + 1) % POINTS.length),
      CYCLE_MS,
    );
    return () => window.clearTimeout(id);
  }, [active, paused, reduceMotion]);

  const prevIndex = (active - 1 + POINTS.length) % POINTS.length;
  const nextIndex = (active + 1) % POINTS.length;
  const goTo = (index: number) =>
    setActive((index + POINTS.length) % POINTS.length);
  const goNext = () => goTo(active + 1);

  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div
            className="flex min-w-0 flex-col justify-center gap-5"
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") setPaused(true);
            }}
            onPointerLeave={(event) => {
              if (event.pointerType === "mouse") setPaused(false);
            }}
          >
            <PickerItem
              key={`prev-${prevIndex}`}
              reduceMotion={reduceMotion}
              ariaLabel={t("vershiny.mentors_prev")}
              onClick={() => goTo(prevIndex)}
            >
              {t(POINTS[prevIndex])}
            </PickerItem>

            <motion.h2
              key={active}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 280, damping: 26, mass: 0.7 }
              }
              className="max-w-[560px] text-display-4 leading-[1.08] text-(--on-bg-high) md:text-display-3"
            >
              {t(POINTS[active])}
            </motion.h2>

            <PickerItem
              key={`next-${nextIndex}`}
              reduceMotion={reduceMotion}
              ariaLabel={t("vershiny.mentors_next")}
              onClick={() => goTo(nextIndex)}
            >
              {t(POINTS[nextIndex])}
            </PickerItem>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={goNext}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setPaused(true);
              }}
              onPointerLeave={(event) => {
                if (event.pointerType === "mouse") setPaused(false);
              }}
              aria-label={t("vershiny.mentors_next")}
              className="relative block aspect-square w-64 cursor-pointer select-none border-0 bg-transparent p-0 transition-transform duration-300 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--on-bg-high)/30 focus-visible:ring-offset-4 focus-visible:ring-offset-(--bg) sm:w-80 lg:w-[400px]"
            >
              {/* Dry mark. */}
              <VershinyLogoIcon
                aria-hidden
                className="absolute inset-0 size-full text-(--outline)"
              />

              {/* Water: the same solid mark, clipped from the bottom up. */}
              <motion.div
                aria-hidden
                style={{ clipPath }}
                className="absolute inset-0"
              >
                <VershinyLogoIcon className="size-full text-(--on-bg-high)" />
              </motion.div>
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}

function PickerItem({
  children,
  onClick,
  ariaLabel,
  reduceMotion,
}: {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel: string;
  reduceMotion: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }
      }
      className="max-w-[560px] text-left text-body-1 leading-snug text-(--on-bg-low) transition-colors hover:text-(--on-bg-medium) md:text-body-2"
    >
      {children}
    </motion.button>
  );
}

export default MentorsSection;
