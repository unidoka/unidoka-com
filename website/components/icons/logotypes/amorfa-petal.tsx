import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * A single leaf of the Amorfa mark.
 *
 * The trefoil is four lobes joined at notches. This is the upper-right
 * lobe, cut at those notches and closed through the mark's centre, then
 * translated so the lobe's own centre sits at the viewBox centre — so a
 * CSS rotation spins the leaf in place instead of swinging it around
 * the parent mark.
 *
 * Fill is `currentColor`; the caller sets a design-token text colour and
 * an opacity. No stroke, no filter, no glow.
 */
export function AmorfaPetal({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="-1 -16 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={cn("block size-full", className)}
      style={style}
    >
      <path
        d="M-0.041 -11.884C0.871 -12.855 1.979 -13.631 3.213 -14.163C4.446 -14.694 5.779 -14.971 7.128 -14.975H8.105C8.944 -14.977 9.776 -14.817 10.552 -14.504C11.327 -14.191 12.032 -13.731 12.626 -13.15C13.219 -12.57 13.69 -11.881 14.01 -11.122C14.33 -10.363 14.494 -9.55 14.492 -8.73C14.473 -6.028 13.38 -3.44 11.445 -1.512L0 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default AmorfaPetal;
