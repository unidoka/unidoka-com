import * as React from "react";
import { cn } from "@/lib/utils";
import type { MarkerProps } from "./marker-underline";

export function MarkerSpark({ bold = false, className, ...props }: MarkerProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("text-(--primary)", className)}
      {...props}
    >
      <path
        d="M12 2.5c.7 5.6 3.4 8.3 9 9-5.6.7-8.3 3.4-9 9-.7-5.6-3.4-8.3-9-9 5.6-.7 8.3-3.4 9-9Z"
        stroke="currentColor"
        strokeWidth={bold ? 2.2 : 1.5}
        strokeLinejoin="round"
        fill={bold ? "currentColor" : "none"}
      />
    </svg>
  );
}
