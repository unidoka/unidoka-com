import * as React from "react";
import { cn } from "@/lib/utils";
import type { DoodleProps } from "./doodle-spark";

export function DoodleStar({ bold = false, className, ...props }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("text-(--primary)", className)}
      {...props}
    >
      <path
        d="m12 2.8 2.1 5.6 5.9-.5-4.6 3.8 1.1 5.9-4.5-3.8-4.6 3.8 1.1-5.9-4.6-3.8 6-.4L12 2.8Z"
        stroke="currentColor"
        strokeWidth={bold ? 2.1 : 1.6}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
