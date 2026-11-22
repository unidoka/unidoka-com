"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface VershinyLogoIconProps
  extends React.SVGProps<SVGSVGElement> {
  /** Change this value to restart the draw animation. */
  replayKey?: number | string;
}

/**
 * The Vershiny staircase mark on its own.
 *
 * This is the exact icon that sits inside <VershinyLogoMono>, in the same
 * coordinate space (the lockup draws it at x16-70 / y14-68), so the two
 * components are visually interchangeable. The viewBox is that box plus
 * two units of padding on every side - enough room for the 1.5-unit
 * draw stroke so it never clips at the edges.
 *
 * Motion is shared with the lockup, not duplicated:
 *   .vershiny-anim-icon                 → stroke draw, then fill flood
 *   vershiny-draw-and-fill-precise      → same curve, per-arc dash length
 *
 * The stagger runs smallest (bottom) arc first and rises to the largest
 * (top) arc, so the mark grows upward. Each arc's perimeter is measured
 * with getTotalLength() before the animation is named - a shared 300-unit
 * dash would keep short arcs hidden until late in the timeline and make
 * the two big arcs surface first, which is the bug this avoids.
 *
 * Fills use `currentColor`, so the mark inherits any design-token text
 * color (`text-(--on-bg-high)`, etc.) in both themes.
 */
const ICON_DELAYS = ["220ms", "165ms", "110ms", "55ms", "0ms"];

export function VershinyLogoIcon({
  replayKey = 0,
  className,
  ...props
}: VershinyLogoIconProps) {
  const svgRef = React.useRef<SVGSVGElement>(null);

  React.useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    svg
      .querySelectorAll<SVGPathElement>(".vershiny-anim-icon")
      .forEach((path) => {
        let length = 300;
        try {
          length = Math.max(1, Math.ceil(path.getTotalLength()));
        } catch {
          /* detached node - keep the fallback */
        }
        // Exact perimeter → every arc draws across the same slice of the
        // timeline instead of appearing late and snapping in.
        path.style.setProperty("--vershiny-len", String(length));
        path.style.strokeDasharray = String(length);
        path.style.strokeDashoffset = String(length);
        // Inline animation-name beats the class shorthand; the inline
        // animation-delay (stagger) survives the override.
        path.style.animationName = "vershiny-draw-and-fill-precise";
      });
    // The svg is keyed by replayKey, so a replay remounts fresh nodes
    // and this effect re-measures them - nothing to clean up.
  }, [replayKey]);

  return (
    <svg
      ref={svgRef}
      key={replayKey}
      width="58"
      height="58"
      viewBox="14 12 58 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      aria-hidden="true"
      className={cn("vershiny-logo-settle shrink-0", className)}
      {...props}
    >
      <path
        className="vershiny-anim-icon"
        style={{ animationDelay: ICON_DELAYS[0] }}
        d="M46 14C59.2548 14 70 24.7452 70 38H58C58 31.3726 52.6274 26 46 26V14Z"
        fill="currentColor"
      />
      <path
        className="vershiny-anim-icon"
        style={{ animationDelay: ICON_DELAYS[1] }}
        d="M37 29C46.9411 29 55 37.0589 55 47H46C46 42.0294 41.9706 38 37 38V29Z"
        fill="currentColor"
      />
      <path
        className="vershiny-anim-icon"
        style={{ animationDelay: ICON_DELAYS[2] }}
        d="M28 41C36.2843 41 43 47.7157 43 56H35.5C35.5 51.8579 32.1421 48.5 28 48.5V41Z"
        fill="currentColor"
      />
      <path
        className="vershiny-anim-icon"
        style={{ animationDelay: ICON_DELAYS[3] }}
        d="M20.5 51.5C27.1274 51.5 32.5 56.8726 32.5 63.5H26.5C26.5 60.1863 23.8137 57.5 20.5 57.5V51.5Z"
        fill="currentColor"
      />
      <path
        className="vershiny-anim-icon"
        style={{ animationDelay: ICON_DELAYS[4] }}
        d="M16 62C19.3137 62 22 64.6863 22 68C19.383 68 18.5149 68 16 68V62Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default VershinyLogoIcon;
