"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type RGB = { r: number; g: number; b: number };

function extractHueFromRGB(c: RGB): number {
  const r = c.r / 255, g = c.g / 255, b = c.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  if (d < 0.03) return -1;
  let h: number;
  if (max === r) h = ((g - b) / d + 6) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return h * 60;
}

function hslToRgb(h: number, s: number, l: number): RGB {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const hh = h / 360;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue2rgb(p, q, hh + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hh) * 255),
    b: Math.round(hue2rgb(p, q, hh - 1 / 3) * 255),
  };
}

function rgba({ r, g, b }: RGB, a: number): string {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function designMesh(hue: number) {
  return {
    base: hslToRgb(hue, 0.44, 0.68),
    highlight: hslToRgb(hue, 0.40, 0.86),
    bright: hslToRgb(hue, 0.28, 0.95),
    shadow: hslToRgb(hue, 0.52, 0.56),
    deep: hslToRgb(hue, 0.48, 0.50),
  };
}

const FALLBACK_HUE = 223;

function useCoverHue(src?: string): number | null {
  const [hue, setHue] = useState<number | null>(null);

  useEffect(() => {
    if (!src) { setHue(FALLBACK_HUE); return; }
    let cancelled = false;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    const settle = (h: number) => { if (!cancelled) setHue(h); };
    const timer = setTimeout(() => settle(FALLBACK_HUE), 2000);

    img.onload = () => {
      clearTimeout(timer);
      if (cancelled) return;
      try {
        const W = 24, H = 24;
        const canvas = document.createElement("canvas");
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext("2d");
        if (!ctx) { settle(FALLBACK_HUE); return; }
        ctx.drawImage(img, 0, 0, W, H);
        const data = ctx.getImageData(0, 0, W, H).data;
        let sx = 0, sy = 0, weight = 0;

        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 128) continue;
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const c = Math.max(r, g, b) - Math.min(r, g, b);
          if (c < 10) continue;
          const h = extractHueFromRGB({ r, g, b });
          if (h < 0) continue;
          const rad = (h * Math.PI) / 180;
          sx += Math.cos(rad) * c;
          sy += Math.sin(rad) * c;
          weight += c;
        }

        if (weight === 0) { settle(FALLBACK_HUE); return; }
        let avg = (Math.atan2(sy, sx) * 180) / Math.PI;
        if (avg < 0) avg += 360;
        settle(avg);
      } catch { settle(FALLBACK_HUE); }
    };
    
    img.onerror = () => { clearTimeout(timer); settle(FALLBACK_HUE); };
    img.src = src;

    return () => { cancelled = true; clearTimeout(timer); };
  }, [src]);

  return hue;
}

export function ProjectGradient({
  imageSrc,
  className,
}: {
  imageSrc?: string;
  className?: string;
}) {
  const hue = useCoverHue(imageSrc);
  const mesh = designMesh(hue ?? FALLBACK_HUE);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className
      )}
      style={{
        WebkitMaskImage: `linear-gradient(to bottom,
          rgba(0,0,0,0.92) 0%,
          black 5%,
          black 100%)`,
        maskImage: `linear-gradient(to bottom,
          rgba(0,0,0,0.92) 0%,
          black 5%,
          black 100%)`,
        opacity: hue === null ? 0 : 1,
        transition: "opacity 1s ease",
      }}
    >
      {/* Base color */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: `color-mix(in srgb, var(--bg) 20%, ${rgba(mesh.base, 1)} 80%)`,
        }}
      />

      {/* Animated Mesh Blobs */}
      <div className="mesh-blob-1 absolute inset-[-18%]" style={{ background: `radial-gradient(ellipse 60% 55% at 20% 82%, ${rgba(mesh.highlight, 1)} 0%, ${rgba(mesh.highlight, 0)} 65%)` }} />
      <div className="mesh-blob-2 absolute inset-[-18%]" style={{ background: `radial-gradient(ellipse 50% 45% at 80% 18%, ${rgba(mesh.bright, 0.85)} 0%, ${rgba(mesh.bright, 0)} 60%)` }} />
      <div className="mesh-blob-3 absolute inset-[-18%]" style={{ background: `radial-gradient(ellipse 75% 65% at 82% 88%, ${rgba(mesh.shadow, 0.95)} 0%, ${rgba(mesh.shadow, 0)} 70%)` }} />
      <div className="mesh-blob-4 absolute inset-[-18%]" style={{ background: `radial-gradient(ellipse 50% 55% at 15% 15%, ${rgba(mesh.deep, 0.75)} 0%, ${rgba(mesh.deep, 0)} 62%)` }} />

      {/* Dot Pattern */}
      <div
        className="hero-dot-drift pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1.4px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* Fine Grain */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ opacity: 0.42, mixBlendMode: "overlay" }}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <filter id="hero-grain-fine">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect x="-20%" y="-20%" width="140%" height="140%" filter="url(#hero-grain-fine)" className="hero-grain-drift" />
      </svg>

      {/* Coarse Grain */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ opacity: 0.16, mixBlendMode: "soft-light" }}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <filter id="hero-grain-coarse">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect x="-20%" y="-20%" width="140%" height="140%" filter="url(#hero-grain-coarse)" />
      </svg>

      {/* Soft Light Sweep */}
      <div
        className="hero-light-sweep pointer-events-none absolute"
        style={{
          inset: "-30%",
          background: "radial-gradient(circle at center, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.12) 30%, transparent 60%)",
          mixBlendMode: "soft-light",
          opacity: 0.5,
        }}
      />
    </div>
  );
}
