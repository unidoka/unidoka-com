import Logo from "./logo";
import { cn } from "@/lib/utils";

interface AnimatedLogoProps {
  className?: string;
  /** Change this value to replay the rise entrance. */
  replayKey?: number | string;
}

/**
 * The full logotype with a one-shot rise entrance and a quiet ambient
 * glow (`.logo-radial-glow`). Two nested wrappers because each class
 * owns the `animation` shorthand — rise on the outer, glow on the inner.
 * No rotation: a rotating wordmark reads as broken. Both motions are
 * disabled under prefers-reduced-motion in globals.css.
 */
export function AnimatedLogo({ className, replayKey = 0 }: AnimatedLogoProps) {
  return (
    <div key={replayKey} className={cn("logo-anim-rise inline-flex", className)}>
      <div className="logo-radial-glow inline-flex h-full w-auto">
        <Logo className="h-full w-auto [&_path]:fill-current [&_circle]:fill-current [&_rect]:fill-current" />
      </div>
    </div>
  );
}

export default AnimatedLogo;
