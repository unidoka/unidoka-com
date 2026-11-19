import * as React from "react";
import { cn } from "@/lib/utils";
import type { DoodleProps } from "./doodle-spark";

export function DoodleBolt({ bold = false, className, ...props }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("text-(--primary)", className)}
      {...props}
    >
      <path
        d="M13.4 2.6 5.3 13.3h5.4l-1 8.1 8.3-11h-5.5l.9-7.8Z"
        stroke="currentColor"
        strokeWidth={bold ? 2.2 : 1.7}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
