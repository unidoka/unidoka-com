import * as React from "react";
import { cn } from "@/lib/utils";
import type { DoodleProps } from "./doodle-spark";

export function DoodleLoop({ bold = false, className, ...props }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("text-(--primary)", className)}
      {...props}
    >
      <path
        d="M3.6 14.7C3.6 8.8 8.1 4.8 12.4 4.8c4.4 0 7.8 3.1 7.8 7.1 0 3.4-2.4 5.9-5.3 5.9-2.5 0-4.4-1.7-4.4-4 0-2 1.6-3.6 3.7-3.6 1.7 0 3 1.2 3 2.7 0 1.4-1 2.4-2.4 2.4"
        stroke="currentColor"
        strokeWidth={bold ? 2.1 : 1.6}
        strokeLinecap="round"
      />
    </svg>
  );
}
