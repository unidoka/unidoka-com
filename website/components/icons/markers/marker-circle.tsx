import * as React from "react";
import { cn } from "@/lib/utils";
import type { MarkerProps } from "./marker-underline";

export function MarkerCircle({ bold = false, className, ...props }: MarkerProps) {
  return (
    <svg
      viewBox="0 0 200 80"
      fill="none"
      aria-hidden="true"
      className={cn("text-(--primary)", className)}
      {...props}
    >
      <path
        d="M24 40C24 21 62 10 102 10c44 0 79 12 79 30 0 20-38 31-82 31-43 0-75-11-75-31Z"
        stroke="currentColor"
        strokeWidth={bold ? 3.6 : 2.2}
        strokeLinecap="round"
      />
      <path
        d="M34 64c22 6 58 8 91 3"
        stroke="currentColor"
        strokeWidth={bold ? 2.6 : 1.6}
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}
