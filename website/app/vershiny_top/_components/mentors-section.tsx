"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
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

const wheelVariants = {
  enter: (dir: number) => ({ y: dir > 0 ? 56 : -56, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (dir: number) => ({ y: dir > 0 ? -56 : 56, opacity: 0 }),
};

export function MentorsSection() {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
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
    const id = window.setTimeout(() => {
      setDirection(1);
      setActive((active + 1) % POINTS.length);
    }, CYCLE_MS);
    return () => window.clearTimeout(id);
  }, [active, paused, reduceMotion]);

  const prevIndex = (active - 1 + POINTS.length) % POINTS.length;
  const nextIndex = (active + 1) % POINTS.length;
  const goTo = (index: number) => {
    const target = (index + POINTS.length) % POINTS.length;
    if (target === active) return;
    const forward = (target - active + POINTS.length) % POINTS.length;
    setDirection(forward <= POINTS.length / 2 ? 1 : -1);
    setActive(target);
  };
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
            {/* A vertical drum: the outgoing set slides past the incoming
                one, so switching reads like an iOS time picker. */}
            <div className="relative [mask-image:linear-gradient(to_bottom,transparent_0%,black_12%,black_88%,transparent_100%)]">
              <AnimatePresence
                mode="popLayout"
                initial={false}
                custom={direction}
              >
                <motion.div
                  key={active}
                  custom={direction}
                  variants={reduceMotion ? undefined : wheelVariants}
                  animate="center"
                  exit={reduceMotion ? undefined : "exit"}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 320,
                          damping: 32,
                          mass: 0.8,
                        }
                  }
                  className="flex flex-col gap-5"
                >
                  <PickerItem
                    ariaLabel={t("vershiny.mentors_prev")}
                    onClick={() => goTo(prevIndex)}
                  >
                    {t(POINTS[prevIndex])}
                  </PickerItem>

                  <h2 className="max-w-[560px] text-display-4 text-(--on-bg-high) md:text-display-3">
                    {t(POINTS[active])}
                  </h2>

                  <PickerItem
                    ariaLabel={t("vershiny.mentors_next")}
                    onClick={() => goTo(nextIndex)}
                  >
                    {t(POINTS[nextIndex])}
                  </PickerItem>
                </motion.div>
              </AnimatePresence>
            </div>
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
}: {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="max-w-[560px] cursor-pointer text-left text-display-6 text-(--on-bg-low) opacity-60 transition-[color,opacity] duration-300 hover:text-(--on-bg-medium) hover:opacity-90 md:text-display-5"
    >
      {children}
    </button>
  );
}

export default MentorsSection;
