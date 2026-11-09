"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export function CycleText({
  labels,
  intervalMs = 8000,
  transitionMs = 1600,
  className,
}: {
  labels: string[];
  intervalMs?: number;
  transitionMs?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  const reduce = useReducedMotion();

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const kids = Array.from(el.children) as HTMLElement[];
    const widest = kids.reduce(
      (max, k) => Math.max(max, k.getBoundingClientRect().width),
      0,
    );
    setWidth((prev) =>
      prev !== null && Math.abs(prev - widest) < 0.5 ? prev : widest,
    );
  }, [labels.join("|")]);

  useEffect(() => {
    if (labels.length < 2 || reduce) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % labels.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [labels.length, intervalMs, reduce]);

  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden",
        className,
      )}
      style={width ? { width } : undefined}
    >
      <span
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 invisible whitespace-nowrap"
      >
        {labels.map((l, i) => (
          <span key={i} className="inline-block">
            {l}
          </span>
        ))}
      </span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={index}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{
            duration: reduce ? 0 : transitionMs / 1000,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="inline-flex items-center whitespace-nowrap"
        >
          {labels[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
