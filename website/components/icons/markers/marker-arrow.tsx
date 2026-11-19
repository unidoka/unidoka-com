import * as React from "react";
import { cn } from "@/lib/utils";
import type { MarkerProps } from "./marker-underline";

export function MarkerArrow({ bold = false, className, ...props }: MarkerProps) {
  return (
    <svg
      viewBox="0 0 64 44"
      fill="none"
      aria-hidden="true"
      className={cn("text-(--primary)", className)}
      {...props}
    >
      <path
        d="M5 37C16 22 29 11 50 8"
        stroke="currentColor"
        strokeWidth={bold ? 3.4 : 2.2}
        strokeLinecap="round"
      />
      <path
        d="M38 3.5 51 8l-7 11"
        stroke="currentColor"
        strokeWidth={bold ? 3.4 : 2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
