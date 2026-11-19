import * as React from "react";
import { cn } from "@/lib/utils";
import type { DoodleProps } from "./doodle-spark";

export function DoodleSquiggle({ bold = false, className, ...props }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 28 20"
      fill="none"
      aria-hidden="true"
      className={cn("text-(--primary)", className)}
      {...props}
    >
      <path
        d="M2.5 14.6c3.6-7.7 6.2 4.2 9.4-3.2 3.1-7.2 5.7 4.5 9 0 1.6-2.2 2.8-3.8 4.6-5.1"
        stroke="currentColor"
        strokeWidth={bold ? 2.4 : 1.7}
        strokeLinecap="round"
      />
    </svg>
  );
}
