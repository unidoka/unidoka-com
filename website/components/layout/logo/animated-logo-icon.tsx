"use client";

import { useEffect, useRef } from "react";
import LogoIcon from "./logo-icon";
import { cn } from "@/lib/utils";

interface AnimatedLogoIconProps {
  className?: string;
  /** Change this value to replay the entrance bloom. */
  replayKey?: number | string;
}

/**
 * The sunburst mark, alive — but still.
 *
 * No rotation. Every painted layer (core + rays) blooms open from its
 * own center with a soft overshoot, staggered in DOM order, then the
 * whole mark exhales a single quiet glow (`.logo-bloom-stage`).
 * Fills are forced to `currentColor` so the mark inherits whatever
 * design-token text color the caller sets, in both themes.
 */
export function AnimatedLogoIcon({
  className,
  replayKey = 0,
}: AnimatedLogoIconProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const layers = Array.from(
      host.querySelectorAll<SVGElement>("path, circle, rect, ellipse"),
    ).filter(
      (el) =>
        !el.closest("defs, clipPath, mask, linearGradient, radialGradient, pattern"),
    );

    layers.forEach((layer, i) => {
      layer.style.animationDelay = `${Math.min(i * 70, 560)}ms`;
      layer.classList.add("logo-anim-bloom");
    });
    host.classList.add("logo-bloom-stage");

    return () => {
      layers.forEach((layer) => {
        layer.classList.remove("logo-anim-bloom");
        layer.style.animationDelay = "";
      });
      host.classList.remove("logo-bloom-stage");
    };
  }, [replayKey]);

  return (
    <div ref={hostRef} className={cn("inline-flex", className)}>
      <LogoIcon className="size-full [&_path]:fill-current [&_circle]:fill-current [&_rect]:fill-current" />
    </div>
  );
}

export default AnimatedLogoIcon;
