import Logo from "./logo";
import { cn } from "@/lib/utils";

interface AnimatedLogoProps {
  className?: string;
  /** Change this value to replay the rise entrance. */
  replayKey?: number | string;
}

/**
 * The full logotype: one-shot rise entrance, then a quiet ambient glow.
 * Both states are declared in CSS, so the wordmark is hidden on the first
 * painted frame rather than flashing complete before an effect runs.
 * Two nested wrappers because each class owns the `animation` shorthand.
 * No rotation — a rotating wordmark reads as broken.
 */
export function AnimatedLogo({ className, replayKey = 0 }: AnimatedLogoProps) {
  return (
    <div
      key={replayKey}
      className={cn("logo-anim-rise inline-flex", className)}
    >
      <div className="logo-radial-glow inline-flex h-full w-auto">
        <Logo className="h-full w-auto [&_path]:fill-current [&_circle]:fill-current [&_rect]:fill-current" />
      </div>
    </div>
  );
}

export default AnimatedLogo;
