"use client";
import { useEffect, useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  threshold = 0.1,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              element.classList.add("is-visible");
            }, delay);
            if (once) observer.unobserve(element);
          } else if (!once) {
            element.classList.remove("is-visible");
          }
        });
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [delay, threshold, once]);

  return (
    <div ref={ref} className={cn("scroll-reveal-container", className)}>
      {children}
    </div>
  );
}
