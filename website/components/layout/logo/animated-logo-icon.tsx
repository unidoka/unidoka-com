import LogoIcon from "./logo-icon";
import { cn } from "@/lib/utils";

interface AnimatedLogoIconProps {
  className?: string;
  /** Change this value to replay the entrance. */
  replayKey?: number | string;
}

/**
 * The sunburst mark.
 *
 * The entrance is declared in CSS on the wrapper (`.logo-mark-enter`), not
 * applied from an effect. That is the whole point: an effect runs *after*
 * the first paint, so the complete mark used to flash on screen for a frame
 * before the animation began. With the hidden state living in the stylesheet
 * the mark is already at opacity 0 on the very first painted frame — server
 * render included — and each ray blooms open from its own centre on a
 * stagger, followed by one quiet settle-glow.
 *
 * No strokes, no rotation. Fills are forced to `currentColor` so the mark
 * inherits whatever design-token text colour the caller sets.
 *
 * Replay works by remounting the wrapper (`key`), which restarts the CSS
 * animations. Reduced-motion users get the finished mark immediately.
 */
export function AnimatedLogoIcon({
  className,
  replayKey = 0,
}: AnimatedLogoIconProps) {
  return (
    <div
      key={replayKey}
      className={cn("logo-mark-enter logo-bloom-stage inline-flex", className)}
    >
      <LogoIcon className="size-full [&_path]:fill-current [&_circle]:fill-current [&_rect]:fill-current" />
    </div>
  );
}

export default AnimatedLogoIcon;
