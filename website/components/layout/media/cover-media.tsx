"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface CoverMediaProps {
  imageSrc: string | null;
  videoSrc: string | null;
  alt: string;
  className?: string;
}

/**
 * Article/solution cover with an editorial reveal: the frame is clipped open
 * while the media settles from a slight overscan. Motion is skipped for
 * users who ask for reduced motion.
 */
export function CoverMedia({ imageSrc, videoSrc, alt, className }: CoverMediaProps) {
  const reduce = useReducedMotion();
  if (!imageSrc && !videoSrc) return null;

  return (
    <motion.div
      initial={
        reduce
          ? false
          : { opacity: 0, scale: 1.04, clipPath: "inset(9% 0% 9% 0%)" }
      }
      animate={{ opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0%)" }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden border border-(--outline)",
        className,
      )}
    >
      {videoSrc ? (
        <video
          src={videoSrc}
          poster={imageSrc || undefined}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc ?? ""}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </motion.div>
  );
}
