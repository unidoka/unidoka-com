"use client";

import { useEffect, useRef } from "react";
import { AmorfaLogo } from "@/components/icons/logotypes/amorfa-logo";
import { cn } from "@/lib/utils";

interface AnimatedAmorfaLogoProps {
  className?: string;
  /** Change this value to replay the bloom. */
  replayKey?: number | string;
}

const STAGGER_MS = 130;
const MAX_STAGGER_MS = 520;

/**
 * Stroke-free reveal for the layered Amorfa mark.
 *
 * Every painted layer blooms from its own center (transform-box:
 * fill-box) with a 4.5% overshoot before settling — no dash arrays,
 * no outlines, original fills untouched. Layers land outer → inner,
 * then the whole mark exhales one soft glow (`.amorfa-bloom-stage`).
 *
 * Nodes inside <defs>/<clipPath>/<mask> are skipped: animating a
 * clipping rect would warp the mark instead of revealing it.
 */
export function AnimatedAmorfaLogo({
  className,
  replayKey = 0,
}: AnimatedAmorfaLogoProps) {
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
      layer.style.animationDelay = `${Math.min(i * STAGGER_MS, MAX_STAGGER_MS)}ms`;
      layer.classList.add("amorfa-anim-bloom");
    });
    host.classList.add("amorfa-bloom-stage");

    return () => {
      layers.forEach((layer) => {
        layer.classList.remove("amorfa-anim-bloom");
        layer.style.animationDelay = "";
      });
      host.classList.remove("amorfa-bloom-stage");
    };
  }, [replayKey]);

  return (
    <div ref={hostRef} className={cn("inline-flex", className)}>
      <AmorfaLogo className="size-full" />
    </div>
  );
}

export default AnimatedAmorfaLogo;
