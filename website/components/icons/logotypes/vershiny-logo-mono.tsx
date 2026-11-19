"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface VershinyLogoMonoProps
  extends React.SVGProps<SVGSVGElement> {
  /** Change this value to restart the draw / slide animation. */
  replayKey?: number | string;
}

const WORDMARK_DELAY = "60ms";
/* Bottom (smallest) arc first, rising to the top. */
const ICON_DELAYS = ["220ms", "165ms", "110ms", "55ms", "0ms"];

export function VershinyLogoMono({
  replayKey = 0,
  className,
  ...props
}: VershinyLogoMonoProps) {
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
        // Exact perimeter → the stroke draws proportionally across the
        // whole timeline instead of appearing late and snapping in.
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
      width="354"
      height="85"
      viewBox="0 0 354 85"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      className={cn("vershiny-logo-settle shrink-0", className)}
      {...props}
    >
      {/* Wordmark */}
      <g
        className="vershiny-anim-text"
        style={{ animationDelay: WORDMARK_DELAY }}
      >
        <path d="M331.075 63.6287V33.9355H337V63.6287H331.075ZM299.609 63.6287V33.9355H305.534V44.7635H312.799C317.084 44.7635 320.363 45.5821 322.636 47.2193C324.909 48.8565 326.045 51.2007 326.045 54.2519C326.045 57.2659 324.909 59.5915 322.636 61.2287C320.363 62.8287 317.084 63.6287 312.799 63.6287H299.609ZM305.534 58.8845H312.52C315.016 58.8845 316.861 58.5124 318.053 57.7682C319.283 56.9868 319.897 55.8147 319.897 54.2519C319.897 52.6891 319.283 51.517 318.053 50.7356C316.861 49.917 315.016 49.5077 312.52 49.5077H305.534V58.8845Z" fill="var(--on-bg-high)" />
        <path d="M266.862 63.6287V33.9355H272.787V63.6287H266.862ZM285.306 63.6287V33.9355H291.23V63.6287H285.306ZM269.042 51.2379V46.4379H288.827V51.2379H269.042Z" fill="var(--on-bg-high)" />
        <path d="M234.387 63.6287V33.9355H240.312V54.81L252.16 33.9355H258.42V63.6287H252.496V43.2565L240.982 63.6287H234.387Z" fill="var(--on-bg-high)" />
        <path d="M188.758 63.6287V33.9355H194.683V63.6287H188.758ZM188.758 63.6287V58.8287H225.981V63.6287H188.758ZM204.463 63.6287V33.9355H210.332V63.6287H204.463ZM220.057 63.6287V33.9355H225.981V63.6287H220.057Z" fill="var(--on-bg-high)" />
        <path d="M155.302 72.0006V33.9354H160.891L161.058 40.2982L160.388 39.9633C161.133 37.768 162.363 36.1121 164.076 34.9959C165.79 33.8424 167.765 33.2656 170.001 33.2656C172.907 33.2656 175.292 33.9912 177.155 35.4424C179.055 36.8563 180.452 38.7354 181.346 41.0796C182.278 43.4238 182.744 45.9913 182.744 48.782C182.744 51.5727 182.278 54.1401 181.346 56.4843C180.452 58.8285 179.055 60.7262 177.155 62.1774C175.292 63.5913 172.907 64.2983 170.001 64.2983C168.51 64.2983 167.113 64.0378 165.809 63.5169C164.505 62.996 163.387 62.2704 162.456 61.3401C161.561 60.3727 160.928 59.2378 160.555 57.9355L161.226 57.2657V72.0006H155.302ZM168.939 59.1634C171.324 59.1634 173.187 58.2518 174.528 56.4285C175.907 54.6052 176.596 52.0564 176.596 48.782C176.596 45.5075 175.907 42.9587 174.528 41.1354C173.187 39.3122 171.324 38.4005 168.939 38.4005C167.374 38.4005 166.014 38.7912 164.859 39.5726C163.704 40.3168 162.81 41.4703 162.176 43.0331C161.543 44.5959 161.226 46.5122 161.226 48.782C161.226 51.0517 161.524 52.968 162.12 54.5308C162.754 56.0936 163.648 57.2657 164.803 58.0471C165.995 58.7913 167.374 59.1634 168.939 59.1634Z" fill="var(--on-bg-high)" />
        <path d="M135.884 64.2983C132.978 64.2983 130.463 63.6657 128.339 62.4006C126.252 61.1355 124.632 59.3308 123.477 56.9866C122.359 54.6424 121.8 51.9076 121.8 48.782C121.8 45.6564 122.359 42.9401 123.477 40.6331C124.632 38.2889 126.252 36.4842 128.339 35.2191C130.425 33.9168 132.885 33.2656 135.716 33.2656C138.399 33.2656 140.765 33.8982 142.814 35.1633C144.864 36.3912 146.447 38.1773 147.565 40.5215C148.72 42.8657 149.298 45.6936 149.298 49.0052V50.5122H127.948C128.097 53.4145 128.861 55.5913 130.239 57.0425C131.655 58.4936 133.555 59.2192 135.94 59.2192C137.691 59.2192 139.144 58.8099 140.299 57.9913C141.454 57.1727 142.256 56.075 142.703 54.6983L148.851 55.089C148.068 57.8425 146.522 60.075 144.212 61.7867C141.939 63.4611 139.163 64.2983 135.884 64.2983ZM127.948 46.0471H143.038C142.852 43.4052 142.088 41.4517 140.747 40.1866C139.442 38.9215 137.766 38.2889 135.716 38.2889C133.593 38.2889 131.841 38.9587 130.463 40.2982C129.121 41.6005 128.283 43.5168 127.948 46.0471Z" fill="var(--on-bg-high)" />
        <path d="M85.9995 63.628V24H100.251C105.021 24 108.616 24.8558 111.038 26.5675C113.46 28.2791 114.671 30.9954 114.671 34.7163C114.671 36.3907 114.317 37.8605 113.609 39.1256C112.901 40.3908 111.858 41.3954 110.479 42.1396C109.138 42.8466 107.536 43.2187 105.673 43.2559L105.617 43.0326C109.008 43.107 111.634 44.0373 113.497 45.8233C115.398 47.5722 116.348 49.8792 116.348 52.7443C116.348 56.3536 115.137 59.0699 112.715 60.8932C110.293 62.7164 106.846 63.628 102.375 63.628H85.9995ZM92.0356 58.2141H102.208C104.704 58.2141 106.642 57.7117 108.02 56.7071C109.436 55.6652 110.144 54.1582 110.144 52.1861C110.144 50.2513 109.436 48.7443 108.02 47.6652C106.642 46.5861 104.704 46.0466 102.208 46.0466H92.0356V58.2141ZM92.0356 40.9117H100.14C102.785 40.9117 104.834 40.4094 106.288 39.4047C107.741 38.4001 108.467 36.9861 108.467 35.1628C108.467 33.2279 107.759 31.7954 106.343 30.8651C104.965 29.8977 102.897 29.414 100.14 29.414H92.0356V40.9117Z" fill="var(--on-bg-high)" />
      </g>

      {/* Staircase icon */}
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

export default VershinyLogoMono;
