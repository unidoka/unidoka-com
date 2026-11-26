"use client";

import { useRef, type ReactNode, type Ref } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionStyle,
} from "motion/react";
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
  quality?: number;
  priority?: boolean;
  /** Called when the image fails to load (e.g. to show a fallback). */
  onImageError?: () => void;
  /** Scroll-linked stretch + reveal. Disable inside cards. */
  animate?: boolean;
  bordered?: boolean;
}

interface CoverMediaViewProps extends CoverMediaProps {
  outerRef?: Ref<HTMLDivElement>;
  innerStyle?: MotionStyle;
  reveal?: boolean;
}

/**
 * Single cover renderer for image or video media.
 *
 * Owns the aspect-ratio frame so every page shows the same crop shape.
 * Pass `aspect` for a strict frame, or `fill` to let the parent size it.
 * Detail pages opt into a scroll stretch; cards stay static so a grid
 * does not register one scroll tracker per tile.
 */
export function CoverMedia({ animate = true, ...props }: CoverMediaProps) {
  const reduce = useReducedMotion();

  if (!animate || reduce) {
    return <CoverMediaView {...props} />;
  }

  return <ScrollCoverMedia {...props} />;
}

function ScrollCoverMedia(props: CoverMediaProps) {
  const ref = useRef<HTMLDivElement>(null);

  // The frame enters slightly narrower/shorter and settles to its full
  // width as it reaches the middle of the viewport.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const scaleX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0.88, 1]),
    { stiffness: 140, damping: 28, mass: 0.35 },
  );
  const scaleY = useSpring(
    useTransform(scrollYProgress, [0, 1], [0.94, 1]),
    { stiffness: 140, damping: 28, mass: 0.35 },
  );

  return (
    <CoverMediaView
      {...props}
      outerRef={ref}
      innerStyle={{ scaleX, scaleY }}
      reveal
    />
  );
}

function CoverMediaView({
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
  quality = 90,
  priority = false,
  onImageError,
  bordered = true,
  outerRef,
  innerStyle,
  reveal = false,
}: CoverMediaViewProps) {
  const hasImage = Boolean(imageSrc?.trim());
  const hasVideo = Boolean(videoSrc?.trim());
  const useVideo = hasVideo && (!preferImage || !hasImage);

  if (!hasImage && !hasVideo) return <>{fallback}</>;

  return (
    <div
      ref={outerRef}
      style={fill ? undefined : { aspectRatio: String(aspect) }}
      className={cn(
        "w-full overflow-hidden",
        fill ? "absolute inset-0 h-full" : "relative",
        className,
      )}
    >
      <motion.div
        initial={reveal ? { opacity: 0 } : false}
        animate={reveal ? { opacity: 1 } : undefined}
        transition={
          reveal
            ? { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
            : undefined
        }
        style={innerStyle}
        className={cn(
          "relative h-full w-full overflow-hidden bg-(--card)",
          bordered && "border border-(--outline)",
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
            quality={quality}
            priority={priority}
            onError={onImageError}
            className={cn("object-cover", mediaClassName)}
          />
        )}
      </motion.div>
    </div>
  );
}
