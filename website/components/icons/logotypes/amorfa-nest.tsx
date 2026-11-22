import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * The Amorfa trefoil, nested inside its own contour.
 *
 * All three mark paths and every contour live in the same coordinate space
 * (the mark's bounding box), so the rings are the mark's silhouette scaled
 * about its true centre - concentric by construction, never by eye.
 *
 * The mark fills the box exactly and stays whole. Contours are drawn with
 * `overflow: visible` and a non-scaling stroke, so they ripple outward past
 * the box as crisp 1px hairlines and are cropped only by the plate, never
 * the mark itself.
 *
 * No glow, no drop-shadow, no filter. Fills are the brand's own blue/white;
 * contours inherit `currentColor` so they follow the theme's text token.
 */

/* Mark geometry, verbatim from the brand asset. */
const OUTER =
  "M144.594 17.4626C146.533 19.8431 147.585 22.7991 147.575 25.8428V26.8784C147.571 28.7687 146.8 30.58 145.432 31.9151C144.064 33.2502 142.209 34 140.277 34C138.925 33.99 137.59 33.706 136.356 33.1657C135.122 32.6255 134.016 31.8409 133.108 30.8615C132.196 31.8321 131.088 32.6079 129.854 33.1398C128.621 33.6717 127.288 33.9483 125.939 33.9522C124.014 33.9565 122.164 33.2146 120.797 31.8889C119.429 30.5632 118.654 28.7617 118.641 26.8784V25.8906C118.643 22.8209 119.724 19.8452 121.704 17.4626C119.762 15.5374 118.664 12.9489 118.641 10.2453C118.636 8.59872 119.299 7.01735 120.483 5.84703C121.668 4.67672 123.278 4.01264 124.962 4.00002H125.939C127.288 4.00392 128.621 4.28052 129.854 4.81243C131.088 5.34434 132.196 6.12007 133.108 7.09083C134.02 6.12007 135.128 5.34434 136.362 4.81243C137.595 4.28052 138.928 4.00392 140.277 4.00002H141.254C142.093 3.99792 142.925 4.15802 143.701 4.47113C144.476 4.78425 145.181 5.2442 145.775 5.82455C146.368 6.40491 146.839 7.09422 147.159 7.85289C147.479 8.61157 147.643 9.42463 147.641 10.2453C147.622 12.9467 146.529 15.5349 144.594 17.4626Z";

const MIDDLE =
  "M140.863 17.9569C142.195 19.5825 142.909 21.6095 142.883 23.6924V24.3615C142.883 25.6292 142.368 26.8449 141.452 27.7412C140.535 28.6375 139.292 29.1411 137.996 29.1411C137.076 29.15 136.166 28.9686 135.323 28.609C134.481 28.2492 133.726 27.7193 133.108 27.0541C132.487 27.7135 131.731 28.2375 130.888 28.5916C130.046 28.9458 129.137 29.1222 128.22 29.1093C126.924 29.1093 125.681 28.6058 124.764 27.7093C123.848 26.813 123.333 25.5973 123.333 24.3296V23.6924C123.307 21.6095 124.021 19.5825 125.353 17.9569C124.059 16.6489 123.335 14.9012 123.333 13.0816C123.331 12.5266 123.441 11.9766 123.657 11.4635C123.873 10.9503 124.191 10.4841 124.592 10.0915C124.994 9.69909 125.471 9.3882 125.995 9.17677C126.52 8.96534 127.082 8.85757 127.65 8.85969H128.22C129.139 8.85082 130.05 9.0322 130.892 9.3919C131.735 9.75164 132.49 10.2815 133.108 10.9468C133.726 10.2815 134.481 9.75164 135.323 9.3919C136.166 9.0322 137.076 8.85082 137.996 8.85969H138.615C139.751 8.87226 140.837 9.32263 141.636 10.1131C142.435 10.9034 142.883 11.9702 142.883 13.0816C142.881 14.9012 142.157 16.6489 140.863 17.9569Z";

const CORE =
  "M137.751 18.3716C138.55 19.3292 138.983 20.5294 138.973 21.7652V22.0997C138.973 22.4797 138.896 22.8561 138.747 23.2069C138.598 23.5578 138.379 23.8765 138.104 24.1445C137.828 24.4125 137.501 24.6245 137.141 24.7685C136.782 24.9125 136.397 24.9855 136.008 24.9834C135.466 24.9925 134.928 24.8909 134.429 24.6853C133.93 24.4795 133.48 24.1741 133.108 23.7885C132.74 24.1876 132.29 24.5062 131.788 24.7231C131.285 24.9399 130.741 25.0504 130.192 25.0472C129.799 25.0473 129.41 24.9706 129.048 24.8217C128.686 24.6728 128.358 24.4547 128.083 24.1802C127.809 23.9056 127.593 23.5801 127.448 23.2228C127.304 22.8656 127.234 22.4837 127.243 22.0997V21.7014C127.236 20.4686 127.661 19.2708 128.449 18.3079C127.693 17.5335 127.263 16.51 127.243 15.4402C127.243 15.1062 127.31 14.7754 127.442 14.4671C127.573 14.1586 127.765 13.8787 128.007 13.6433C128.25 13.4078 128.537 13.2216 128.853 13.0952C129.17 12.9688 129.508 12.9048 129.85 12.9069H130.208C130.752 12.9019 131.292 13.0085 131.791 13.2197C132.29 13.431 132.739 13.7424 133.108 14.1337C133.474 13.7366 133.921 13.4193 134.421 13.2025C134.921 12.9856 135.461 12.874 136.008 12.875H136.366C136.711 12.8729 137.052 12.9379 137.37 13.0663C137.689 13.1946 137.978 13.3837 138.22 13.6226C138.463 13.8614 138.655 14.1452 138.784 14.4573C138.913 14.7693 138.978 15.1035 138.973 15.4402C138.972 16.5356 138.533 17.5874 137.751 18.3716Z";

/* True centre of the mark's bounding box - the pivot for every contour. */
const CX = 133.141;
const CY = 19;
const VIEWBOX = "118.141 4 30 30";

const BLUE = "#336DFF";

/**
 * Contours nest outward from the silhouette. `depth` is the pointer-parallax
 * amplitude in CSS pixels: outer rings travel further, so the stack reads as
 * real depth rather than a flat pattern.
 */
const CONTOURS = [
  { scale: 1.22, opacity: 0.22, depth: 4, delay: 140, breathe: "13s" },
  { scale: 1.5, opacity: 0.14, depth: 8, delay: 250, breathe: "16s" },
  { scale: 1.86, opacity: 0.09, depth: 13, delay: 360, breathe: "19s" },
  { scale: 2.3, opacity: 0.055, depth: 19, delay: 470, breathe: "23s" },
] as const;

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

function scaleAboutCentre(s: number) {
  return `translate(${CX} ${CY}) scale(${s}) translate(${-CX} ${-CY})`;
}

export function AmorfaNest({ className }: { className?: string }) {
  return (
    <div className={cn("relative size-full", className)}>
      {/* Nested contours - the mark's own outline, scaled about its centre.
          Each sits on its own layer so parallax, ambient breathe and the
          entrance never compete for the same transform. */}
      {CONTOURS.map((c) => (
        <div
          key={c.scale}
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            transform: `translate3d(calc(var(--nest-dx, 0) * ${c.depth}px), calc(var(--nest-dy, 0) * ${c.depth}px), 0)`,
            transition: `transform 560ms ${EASE}`,
          }}
        >
          <div
            className="amorfa-nest-breathe size-full"
            style={{ animationDuration: c.breathe }}
          >
            <svg
              viewBox={VIEWBOX}
              overflow="visible"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
              className="size-full overflow-visible text-(--on-bg-high)"
            >
              <g transform={scaleAboutCentre(c.scale)}>
                <path
                  d={OUTER}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                  className="amorfa-nest-ring"
                  style={
                    {
                      "--ring-o": c.opacity,
                      animationDelay: `${c.delay}ms`,
                    } as CSSProperties
                  }
                />
              </g>
            </svg>
          </div>
        </div>
      ))}

      {/* The mark itself - whole, at full size, never clipped. */}
      <div
        className="absolute inset-0"
        style={{
          transform:
            "translate3d(calc(var(--nest-dx, 0) * -5px), calc(var(--nest-dy, 0) * -4px), 0)",
          transition: `transform 460ms ${EASE}`,
        }}
      >
        <svg
          viewBox={VIEWBOX}
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Amorfa"
          focusable="false"
          className="size-full"
        >
          <path
            d={OUTER}
            fill={BLUE}
            className="amorfa-nest-layer"
            style={{ animationDelay: "0ms" }}
          />
          <path
            d={MIDDLE}
            fill="#ffffff"
            className="amorfa-nest-layer"
            style={{ animationDelay: "110ms" }}
          />
          <path
            d={CORE}
            fill={BLUE}
            className="amorfa-nest-layer"
            style={{ animationDelay: "220ms" }}
          />
        </svg>
      </div>
    </div>
  );
}

export default AmorfaNest;
