"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface CoverMediaProps {
  imageSrc?: string | null;
  videoSrc?: string | null;
  alt: string;
  /**
   * CSS aspect-ratio for the frame. Pass `16 / 9` for articles and
   * `4 / 3` for solutions. Ignored when `fill` is set.
   */
  aspect?: number | string;
  /** Fill the parent instead of imposing its own aspect ratio. */
  fill?: boolean;
  /** Rendered when neither an image nor a video is available. */
  fallback?: ReactNode;
  /** Prefer the poster image when both sources exist. Videos win by default. */
  preferImage?: boolean;
  className?: string;
  mediaClassName?: string;
  sizes?: string;
  priority?: boolean;
  /** Called when the image fails to load (e.g. to show a fallback). */
  onImageError?: () => void;
  /** Editorial open-on-load reveal. Disable inside cards. */
  animate?: boolean;
  bordered?: boolean;
}

/**
 * Single cover renderer for image or video media.
 *
 * Owns the aspect-ratio frame so every page shows the same crop shape.
 * Pass `aspect` for a strict frame, or `fill` to let the parent size it.
 */
export function CoverMedia({
  imageSrc,
  videoSrc,
  alt,
  aspect = 4 / 3,
  fill = false,
  fallback = null,
  preferImage = false,
  className,
  mediaClassName,
  sizes = "(max-width: 768px) 100vw, 820px",
  priority = false,
  onImageError,
  animate = true,
  bordered = true,
}: CoverMediaProps) {
  const reduce = useReducedMotion();
  const hasImage = Boolean(imageSrc?.trim());
  const hasVideo = Boolean(videoSrc?.trim());
  const useVideo = hasVideo && (!preferImage || !hasImage);

  if (!hasImage && !hasVideo) return <>{fallback}</>;

  return (
    <motion.div
      initial={
        animate && !reduce
          ? { opacity: 0, scale: 1.04, clipPath: "inset(9% 0% 9% 0%)" }
          : false
      }
      animate={
        animate
          ? { opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0%)" }
          : undefined
      }
      transition={
        animate
          ? { duration: 1.1, ease: [0.16, 1, 0.3, 1] as const }
          : undefined
      }
      style={fill ? undefined : { aspectRatio: String(aspect) }}
      className={cn(
        "w-full overflow-hidden bg-(--card)",
        fill ? "absolute inset-0 h-full" : "relative",
        bordered && "border border-(--outline)",
        className,
      )}
    >
      {useVideo ? (
        <video
          src={videoSrc ?? ""}
          poster={hasImage ? imageSrc ?? undefined : undefined}
          autoPlay
          muted
          loop
          playsInline
          className={cn(
            "absolute inset-0 h-full w-full object-cover",
            mediaClassName,
          )}
        />
      ) : (
        <Image
          src={imageSrc ?? ""}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={onImageError}
          className={cn("object-cover", mediaClassName)}
        />
      )}
    </motion.div>
  );
}
