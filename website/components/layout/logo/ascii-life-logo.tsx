"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface AsciiLifeLogoProps {
  ascii: string;
  /** Change this value to seed a fresh colony. */
  replayKey?: number | string;
  className?: string;
}

type Grid = {
  cols: number;
  rows: number;
  mask: Uint8Array;
};

/** Characters a cell walks through as it matures, then cycles. */
const GLYPHS = ["+", "x", "*", "=", "#", ":", "-", "·"];
// The ASCII art was authored for a monospace cell that is taller than it
// is wide (~0.6em). Square canvas cells stretch the mark horizontally;
// these dimensions keep the original proportions.
const CELL_W = 6;
const CELL_H = 10;
const STEP_MS = 100;
// Conway alone dies out in a silhouette this small. A steady birth rate
// keeps ~30% of the mask alive, so the mark breathes instead of decaying
// to a handful of frozen blobs.
const SPAWN_RATE = 0.075;
const DECAY_RATE = 0.0035;

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

function seedColony(cols: number, rows: number, mask: Uint8Array) {
  const alive = new Uint8Array(mask.length);
  let count = 0;
  for (let i = 0; i < mask.length; i += 1) {
    if (mask[i] && Math.random() < 0.26) {
      alive[i] = 1;
      count += 1;
    }
  }
  // A completely dead start looks broken. Drop a nucleus near the centre.
  if (count < 24) {
    const cx = Math.floor(cols / 2);
    const cy = Math.floor(rows / 2);
    for (let y = cy - 4; y <= cy + 4; y += 1) {
      for (let x = cx - 4; x <= cx + 4; x += 1) {
        if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
        const i = y * cols + x;
        if (mask[i]) alive[i] = 1;
      }
    }
  }
  return alive;
}

/**
 * Conway's Game of Life living inside the ASCII wordmark.
 *
 * The mark is a mask, not a picture: cells are born, mature through
 * glyphs, and die inside the silhouette while spontaneous births keep
 * the colony from settling. Click anywhere on it to seed a new one.
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

    let alive = seedColony(cols, rows, mask);
    let next = new Uint8Array(total);
    const ages = new Uint8Array(total);

    const neighbours = (x: number, y: number) => {
      let n = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        const ny = y + dy;
        if (ny < 0 || ny >= rows) continue;
        for (let dx = -1; dx <= 1; dx += 1) {
          if (!dx && !dy) continue;
          const nx = x + dx;
          if (nx < 0 || nx >= cols) continue;
          n += alive[ny * cols + nx];
        }
      }
      return n;
    };

    const step = () => {
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const i = y * cols + x;
          if (!mask[i]) {
            next[i] = 0;
            ages[i] = 0;
            continue;
          }
          const n = neighbours(x, y);
          let live = alive[i] ? (n === 2 || n === 3 ? 1 : 0) : n === 3 ? 1 : 0;
          // Life patterns settle. These two dice keep the logo churning:
          // spontaneous births inside the mark and occasional deaths.
          if (!live && Math.random() < SPAWN_RATE) live = 1;
          if (live && Math.random() < DECAY_RATE) live = 0;
          next[i] = live;
          ages[i] = live ? (ages[i] + 1) % 256 : 0;
        }
      }
      const swap = alive;
      alive = next;
      next = swap;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = `700 ${CELL_H}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
      ctx.textBaseline = "top";
      ctx.fillStyle = color;

      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const i = y * cols + x;
          if (!mask[i]) continue;
          const age = ages[i];
          if (!alive[i]) {
            ctx.globalAlpha = 0.3;
            ctx.fillRect(
              x * CELL_W + CELL_W * 0.32,
              y * CELL_H + CELL_H * 0.4,
              2,
              2,
            );
            continue;
          }
          ctx.globalAlpha = 0.7 + Math.min(age, 6) * 0.05;
          // The glyph walks the alphabet as the cell ages, so even a
          // stable block keeps twitching instead of freezing.
          const glyph =
            GLYPHS[((age >> 1) + x * 3 + y * 5) % GLYPHS.length];
          ctx.fillText(glyph, x * CELL_W, y * CELL_H);
        }
      }
      ctx.globalAlpha = 1;
    };

    if (reducedMotion) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.7;
      ctx.font = `700 ${CELL_H}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
      ctx.textBaseline = "top";
      for (let i = 0; i < total; i += 1) {
        if (!mask[i]) continue;
        const x = i % cols;
        const y = Math.floor(i / cols);
        ctx.fillText("=", x * CELL_W, y * CELL_H);
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
