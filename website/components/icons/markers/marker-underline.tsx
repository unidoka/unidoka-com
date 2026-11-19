import * as React from "react";
import { cn } from "@/lib/utils";

export interface MarkerProps extends React.SVGProps<SVGSVGElement> {
  bold?: boolean;
}

export function MarkerUnderline({ bold = false, className, ...props }: MarkerProps) {
  return (
    <svg
      viewBox="0 0 160 20"
      fill="none"
      aria-hidden="true"
      className={cn("text-(--primary)", className)}
      {...props}
    >
      <path
        d="M4 13C25 6 55 5 82 7c20 1.5 42 2 74-2"
        stroke="currentColor"
        strokeWidth={bold ? 4 : 2.4}
        strokeLinecap="round"
      />
      <path
        d="M10 17c28-4 60-4 92-1"
        stroke="currentColor"
        strokeWidth={bold ? 2.6 : 1.6}
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}
