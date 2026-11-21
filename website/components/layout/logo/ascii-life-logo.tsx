"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface AsciiLifeLogoProps {
  ascii: string;
  /** Change this value to restart growth from the seed. */
  replayKey?: number | string;
  className?: string;
}

type Grid = {
  cols: number;
  rows: number;
  mask: Uint8Array;
};

/** Growth colour: young cells and the advancing edge. */
const GROW_COLOR = "#F17735";

// No dots in the live layer — the mark has to read as symbols, not dust.
const GLYPHS = ["#", "=", "*", "x", "+", "%", "&", "@"];
const YOUNG_GLYPHS = ["+", "*", "#", "%", "&", "@", "@"];

// The ASCII art was authored for a monospace cell that is taller than it
// is wide (~0.6em). Square canvas cells stretch the mark horizontally;
// these dimensions keep the original proportions.
const CELL_W = 6;
const CELL_H = 10;
// Slow enough to read as growth, not flicker.
const STEP_MS = 180;

// Phase 1: the mark unfolds from its centre. After this, the colony
// keeps multiplying into the remaining space.
const GROWTH_TICKS = 30;
const GROWTH_REVEAL = 0.85;

// Life-cycle timing, in ticks.
const MATURITY = 7;

// The colony is immortal: cells only age, never die. Growth stops at a
// soft ceiling so the mark keeps a little grain instead of becoming a
// solid block, and births are budgeted per tick so state stays bounded.
const MAX_DENSITY = 0.95;
const GROWTH_RATE = 0.06;
const MAX_BIRTHS_PER_TICK = 24;
const SEASON_TICKS = 30;

// Once the mark is nearly full there is no empty neighbour left to
// colonise, so cells divide in place: a mature cell and one of its
// neighbours restart as young. The population never drops; only the
// growth pulse keeps moving.
const DIVISION_RATE = 0.003;
const MAX_DIVISIONS_PER_TICK = 6;
const MAX_AGE = 255;

const NEIGHBOURS = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0], [1, 0],
  [-1, 1], [0, 1], [1, 1],
] as const;

function parseMask(raw: string): Grid | null {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  let start = 0;
  let end = lines.length;
  while (start < end && !lines[start].trim()) start += 1;
  while (end > start && !lines[end - 1].trim()) end -= 1;

  const rowsRaw = lines.slice(start, end);
  let minX = Number.POSITIVE_INFINITY;
  let maxX = -1;
  for (const line of rowsRaw) {
    for (let x = 0; x < line.length; x += 1) {
      if (line[x] !== " ") {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
  }
  if (maxX < minX) return null;

  // 192 columns would make every glyph sub-pixel on a laptop. Sampling
  // 2x2 blocks keeps the silhouette and leaves room for the cells to
  // read as cells rather than noise.
  const width = maxX - minX + 1;
  const stride = width > 140 ? 2 : 1;
  const cols = Math.ceil(width / stride);
  const rows = Math.ceil(rowsRaw.length / stride);
  const mask = new Uint8Array(cols * rows);

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      let on = 0;
      for (let dy = 0; dy < stride && !on; dy += 1) {
        const line = rowsRaw[y * stride + dy] ?? "";
        for (let dx = 0; dx < stride; dx += 1) {
          if ((line[minX + x * stride + dx] ?? " ") !== " ") {
            on = 1;
            break;
          }
        }
      }
      mask[y * cols + x] = on;
    }
  }

  return { cols, rows, mask };
}

/** Stable pseudo-random 0..1 so the growth edge is organic but repeatable. */
function cellNoise(i: number): number {
  let h = (i * 2654435761) >>> 0;
  h ^= h >>> 13;
  h = (h * 2246822519) >>> 0;
  h ^= h >>> 16;
  return h / 4294967296;
}

/**
 * Radial threshold per cell: distance from the centre plus a little noise.
 * Raising a single progress value from 0 to 1 reveals the mark outward
 * from that seed point.
 */
function buildGrowthThresholds(
  cols: number,
  rows: number,
  mask: Uint8Array,
): Float32Array {
  let sumX = 0;
  let sumY = 0;
  let count = 0;
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      if (!mask[y * cols + x]) continue;
      sumX += x;
      sumY += y;
      count += 1;
    }
  }
  const cx = count ? sumX / count : cols / 2;
  const cy = count ? sumY / count : rows / 2;

  const distances = new Float32Array(mask.length);
  let maxDist = 0;
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const i = y * cols + x;
      if (!mask[i]) continue;
      const d = Math.hypot(x - cx, y - cy);
      distances[i] = d;
      if (d > maxDist) maxDist = d;
    }
  }

  const thresholds = new Float32Array(mask.length);
  for (let i = 0; i < mask.length; i += 1) {
    if (!mask[i]) continue;
    const radial = maxDist ? distances[i] / maxDist : 0;
    thresholds[i] = radial * 0.92 + cellNoise(i) * 0.08;
  }
  return thresholds;
}

/**
 * A growing colony living inside the ASCII wordmark.
 *
 * First the mark grows outward from its centre (young cells are orange).
 * Then the colony lives: cells mature, keep reproducing into the space
 * that is left, and never die. Click to grow it again from the seed.
 */
export function AsciiLifeLogo({
  ascii,
  replayKey = 0,
  className,
}: AsciiLifeLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const grid = useMemo(() => parseMask(ascii), [ascii]);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !grid) return;

    const { cols, rows, mask } = grid;
    const total = cols * rows;
    const maskCount = mask.reduce((sum, cell) => sum + cell, 0);
    const thresholds = buildGrowthThresholds(cols, rows, mask);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = cols * CELL_W;
    canvas.height = rows * CELL_H;

    let color = getComputedStyle(canvas).color || "#111";
    const theme = new MutationObserver(() => {
      color = getComputedStyle(canvas).color || color;
    });
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    const ages = new Uint8Array(total);
    let tick = 0;

    const neighbours = (x: number, y: number) => {
      let n = 0;
      for (const [dx, dy] of NEIGHBOURS) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        if (ages[ny * cols + nx]) n += 1;
      }
      return n;
    };

    const grow = () => {
      // Smoothstep: the bloom starts gently and eases as it reaches the
      // edges instead of snapping at a constant speed.
      const t = Math.min(tick / GROWTH_TICKS, 1);
      const progress = t * t * (3 - 2 * t) * GROWTH_REVEAL;

      for (let i = 0; i < total; i += 1) {
        if (ages[i] && ages[i] < MAX_AGE) ages[i] += 1;
      }
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const i = y * cols + x;
          if (!mask[i] || ages[i] || thresholds[i] > progress) continue;
          ages[i] = 1;
        }
      }
    };

    const live = () => {
      let alive = 0;

      // Immortal cells: they only age. Nothing is ever cleared, so the
      // mark can never shrink back or disappear.
      for (let i = 0; i < total; i += 1) {
        if (!ages[i]) continue;
        if (ages[i] < MAX_AGE) ages[i] += 1;
        alive += 1;
      }

      const density = alive / maskCount;
      const room = Math.max(0, 1 - density / MAX_DENSITY);
      // A slow seasonal wave keeps the growth from freezing.
      const season = 0.55 + 0.45 * Math.sin(tick / SEASON_TICKS);
      const birthRate = GROWTH_RATE * room * season;
      let births = 0;

      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          if (births >= MAX_BIRTHS_PER_TICK) return;
          const i = y * cols + x;
          // Only mature cells reproduce, and each spreads at most one
          // child per tick into a random empty neighbour.
          if (ages[i] < MATURITY || Math.random() >= birthRate) continue;
          const start = Math.floor(Math.random() * NEIGHBOURS.length);
          for (let k = 0; k < NEIGHBOURS.length; k += 1) {
            const [dx, dy] = NEIGHBOURS[(start + k) % NEIGHBOURS.length];
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
            const j = ny * cols + nx;
            if (mask[j] && ages[j] === 0) {
              ages[j] = 1;
              births += 1;
              break;
            }
          }
        }
      }

      // Full mark: keep the growth pulse alive by resetting mature cells
      // and one neighbour to a young age. Nothing is removed.
      if (density < MAX_DENSITY * 0.98) return;
      let divisions = 0;
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          if (divisions >= MAX_DIVISIONS_PER_TICK) return;
          const i = y * cols + x;
          if (ages[i] < MATURITY || Math.random() >= DIVISION_RATE) continue;
          const start = Math.floor(Math.random() * NEIGHBOURS.length);
          for (let k = 0; k < NEIGHBOURS.length; k += 1) {
            const [dx, dy] = NEIGHBOURS[(start + k) % NEIGHBOURS.length];
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
            const j = ny * cols + nx;
            if (!mask[j] || ages[j] === 0) continue;
            ages[i] = 1;
            ages[j] = 1;
            divisions += 1;
            break;
          }
        }
      }
    };

    const step = () => {
      tick += 1;
      if (tick <= GROWTH_TICKS) {
        grow();
      } else {
        live();
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.textBaseline = "top";

      // A whisper of the not-yet-grown mark. Kept to a single pixel so it
      // reads as paper grain, not as a field of dots.
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.14;
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const i = y * cols + x;
          if (!mask[i] || ages[i]) continue;
          ctx.fillRect(x * CELL_W + CELL_W * 0.4, y * CELL_H + CELL_H * 0.44, 1, 1);
        }
      }

      // Growing edge: empty cells next to life.
      ctx.fillStyle = GROW_COLOR;
      ctx.globalAlpha = 0.6;
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const i = y * cols + x;
          if (!mask[i] || ages[i]) continue;
          if (neighbours(x, y) === 0) continue;
          ctx.fillRect(x * CELL_W + CELL_W * 0.26, y * CELL_H + CELL_H * 0.32, 2.8, 2.8);
        }
      }

      // Young cells: orange, slightly smaller — the visible growth front.
      ctx.font = `800 ${Math.round(CELL_H * 0.88)}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
      ctx.fillStyle = GROW_COLOR;
      ctx.globalAlpha = 1;
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const i = y * cols + x;
          const age = ages[i];
          if (!age || age >= MATURITY) continue;
          const glyph = YOUNG_GLYPHS[Math.min(age - 1, YOUNG_GLYPHS.length - 1)];
          ctx.fillText(glyph, x * CELL_W + 0.5, y * CELL_H + 1);
        }
      }

      // Mature cells: full-size bold symbols.
      ctx.font = `800 ${CELL_H}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
      ctx.fillStyle = color;
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const i = y * cols + x;
          const age = ages[i];
          if (age < MATURITY) continue;
          ctx.globalAlpha = 0.82 + Math.min(age - MATURITY, 8) * 0.022;
          const glyph = GLYPHS[((tick >> 2) + x * 3 + y * 5) % GLYPHS.length];
          ctx.fillText(glyph, x * CELL_W, y * CELL_H);
        }
      }

      ctx.globalAlpha = 1;
    };

    if (reducedMotion) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.8;
      ctx.font = `800 ${CELL_H}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
      ctx.textBaseline = "top";
      for (let i = 0; i < total; i += 1) {
        if (!mask[i]) continue;
        const x = i % cols;
        const y = Math.floor(i / cols);
        ctx.fillText("#", x * CELL_W, y * CELL_H);
      }
      ctx.globalAlpha = 1;
      theme.disconnect();
      return;
    }

    let raf = 0;
    let last = 0;
    let visible = true;

    const frame = (now: number) => {
      if (visible && now - last >= STEP_MS) {
        step();
        draw();
        last = now;
      }
      raf = window.requestAnimationFrame(frame);
    };

    const intersection = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
      },
      { threshold: 0.05 },
    );
    intersection.observe(canvas);

    draw();
    raf = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(raf);
      intersection.disconnect();
      theme.disconnect();
    };
  }, [grid, replayKey, reducedMotion]);

  if (!grid) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("block h-auto w-full", className)}
      style={{ aspectRatio: `${grid.cols * CELL_W} / ${grid.rows * CELL_H}` }}
    />
  );
}

export default AsciiLifeLogo;
