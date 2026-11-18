import type { CSSProperties } from "react";
import { AmorfaLogo } from "@/components/icons/logotypes/amorfa-logo";
import { cn } from "@/lib/utils";

interface AnimatedAmorfaLogoProps {
  className?: string;
  /** Change this value to replay the bloom. */
  replayKey?: number | string;
  /** Offset the whole entrance, so stacked copies can bloom out of phase. */
  delayMs?: number;
}

/**
 * The layered Amorfa trefoil, revealed stroke-free.
 *
 * Each concentric layer scales open from its own centre with a soft overshoot,
 * staggered outer → inner. The choreography lives in `.amorfa-mark-enter`
 * (globals.css) so it is present on the first painted frame — no flash of the
 * finished mark, no dependency on hydration, and it degrades to a plain visible
 * logo if the selector is unsupported.
 *
 * Replay works by remounting the wrapper (`key`), which restarts the CSS
 * animations. `delayMs` shifts the sequence for parallax stacks.
 * Reduced-motion users get the finished mark immediately.
 */
export function AnimatedAmorfaLogo({
  className,
  replayKey = 0,
  delayMs = 0,
}: AnimatedAmorfaLogoProps) {
  return (
    <div
      key={replayKey}
      className={cn("amorfa-mark-enter inline-flex", className)}
      style={{ "--amorfa-delay": `${delayMs}ms` } as CSSProperties}
    >
      <AmorfaLogo className="size-full" />
    </div>
  );
}

export default AnimatedAmorfaLogo;
