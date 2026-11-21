"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

export interface FaqItem {
  questionKey: string;
  answerKey: string;
  image: string;
}

interface FaqSectionProps {
  titleKey: string;
  items: FaqItem[];
  /** When true, image sits on the left and FAQ list on the right (desktop). */
  reversed?: boolean;
  /** Auto-rotation interval in ms. Set to 0 to disable. */
  autoRotateInterval?: number;
  className?: string;
}

const DEFAULT_INTERVAL = 5000;

export function FaqSection({
  titleKey,
  items,
  reversed = false,
  autoRotateInterval = DEFAULT_INTERVAL,
  className,
}: FaqSectionProps) {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);

  const handleToggle = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  // Auto-rotate. Restarting the interval whenever activeIndex changes means
  // a manual click resets the countdown - the user never sees an immediate
  // jump caused by a timer that was already halfway through its cycle.
  useEffect(() => {
    if (autoRotateInterval <= 0 || items.length < 2) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, autoRotateInterval);
    return () => clearInterval(interval);
  }, [activeIndex, items.length, autoRotateInterval]);

  const activeItem = items[activeIndex];

  return (
    <section className={cn("py-16 md:py-24", className)}>
      <Container>
        <h2 className="relative mb-10 text-display-3 leading-[1.05]! md:text-display-2">
          {t(titleKey)}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* FAQ list */}
          <div
            className={cn(
              "flex flex-col divide-y divide-(--outline) border-y border-(--outline)",
              reversed && "lg:order-2"
            )}
          >
            {items.map((item, index) => {
              const isActive = activeIndex === index;
              return (
                <div key={index} className="group relative">
                  <button
                    type="button"
                    onClick={() => handleToggle(index)}
                    className={cn(
                      "w-full flex items-center justify-between gap-4 py-5 text-left transition-colors",
                      isActive
                        ? "text-(--on-bg-high)"
                        : "text-(--on-bg-medium) hover:text-(--on-bg-high)"
                    )}
                  >
                    <span className="text-heading-3 md:text-heading-2 leading-tight">
                      {t(item.questionKey)}
                    </span>
                  </button>

                  {/* Progress bar - fills over the auto-rotate interval */}
                  {isActive && autoRotateInterval > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-(--outline) overflow-hidden">
                      <div
                        key={`progress-${activeIndex}`}
                        className="h-full bg-(--on-bg-high) origin-left faq-progress-bar"
                        style={{
                          animationDuration: `${autoRotateInterval}ms`,
                        }}
                      />
                    </div>
                  )}

                  {/* Answer content - smooth fold/unfold */}
                  <div
                    className={cn(
                      "grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                      isActive
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-5 text-body-3 text-(--on-bg-medium) leading-relaxed max-w-xl">
                        {t(item.answerKey)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Image panel */}
          <div
            className={cn(
              "relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-(--card) border border-(--outline) lg:sticky lg:top-32",
              reversed && "lg:order-1"
            )}
          >
            {items.map((item, index) => (
              <Image
                key={index}
                src={item.image}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={cn(
                  "object-cover transition-opacity duration-700 ease-out",
                  index === activeIndex
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                )}
                priority={index === 0}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default FaqSection;
