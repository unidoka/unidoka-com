"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import LogoIcon from "./logo-icon";
import Logo from "./logo";

/**
 * Animated variants of the logo.
 *
 * Adding `animated` makes the rays grow outward from the centre - the
 * wrapper gets a radial mask whose inner stop expands and contracts,
 * so the sunburst appears to reach out and retract. No rotation, no
 * pulse rings. The wordmark gets the same reveal so both variants
 * read as one family.
 *
 * The original `Logo` and `LogoIcon` are untouched - these wrappers
 * are additive, so every existing call site keeps working.
 */

interface AnimatedLogoIconProps extends HTMLAttributes<HTMLDivElement> {
  animated?: boolean;
  /** ClassName forwarded to the inner LogoIcon SVG (colour, filters…). */
  svgClassName?: string;
}

export const AnimatedLogoIcon = forwardRef<
  HTMLDivElement,
  AnimatedLogoIconProps
>(({ animated = false, className, svgClassName, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative inline-flex items-center justify-center",
      animated && "logo-radial-grow",
      className,
    )}
    {...props}
  >
    <LogoIcon className={cn("size-full", svgClassName)} />
  </div>
));
AnimatedLogoIcon.displayName = "AnimatedLogoIcon";

interface AnimatedLogoProps extends HTMLAttributes<HTMLDivElement> {
  animated?: boolean;
}

export const AnimatedLogo = forwardRef<HTMLDivElement, AnimatedLogoProps>(
  ({ animated = false, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative inline-flex items-center",
        animated && "logo-radial-grow",
        className,
      )}
      {...props}
    >
      <Logo />
    </div>
  ),
);
AnimatedLogo.displayName = "AnimatedLogo";
