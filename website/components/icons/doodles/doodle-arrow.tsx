import * as React from "react";
import { cn } from "@/lib/utils";
import type { DoodleProps } from "./doodle-spark";

export function DoodleArrow({ bold = false, className, ...props }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 64 44"
      fill="none"
      aria-hidden="true"
      className={cn("text-(--primary)", className)}
      {...props}
    >
      <path
        d="M4.5 37.5C14 25 27 14 49.5 8.5"
        stroke="currentColor"
        strokeWidth={bold ? 3.2 : 2.1}
        strokeLinecap="round"
      />
      <path
        d="m37 3.5 13.5 5-7 12"
        stroke="currentColor"
        strokeWidth={bold ? 3.2 : 2.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 31.5c7-2 14-1 19 2"
        stroke="currentColor"
        strokeWidth={bold ? 1.9 : 1.3}
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}
