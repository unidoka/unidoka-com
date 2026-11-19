import * as React from "react";
import { cn } from "@/lib/utils";

export interface DoodleProps extends React.SVGProps<SVGSVGElement> {
  bold?: boolean;
}

export function DoodleSpark({ bold = false, className, ...props }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("text-(--primary)", className)}
      {...props}
    >
      <path
        d="M11.8 2.6c.8 5.3 3.6 8.1 8.9 8.9-5.3.8-8.1 3.6-8.9 8.9-.8-5.3-3.6-8.1-8.9-8.9 5.3-.8 8.1-3.6 8.9-8.9Z"
        stroke="currentColor"
        strokeWidth={bold ? 2.2 : 1.7}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M19.2 2.9c.2 1.7 1.1 2.6 2.8 2.8-1.7.2-2.6 1.1-2.8 2.8-.2-1.7-1.1-2.6-2.8-2.8 1.7-.2 2.6-1.1 2.8-2.8Z"
        stroke="currentColor"
        strokeWidth={bold ? 1.8 : 1.3}
        strokeLinejoin="round"
        opacity="0.65"
      />
    </svg>
  );
}
