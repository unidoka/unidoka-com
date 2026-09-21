import * as React from "react"
import { cn } from "@/lib/utils"
export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string,
}
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ className, size = 24, children, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        xmlns="http://w3.org"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        // stroke="currentColor"
        // strokeWidth="2"
        // strokeLinecap="round"
        // strokeLinejoin="round"
        className={cn("shrink-0", className)}
        {...props}
      >
        {children}
      </svg>
    )
  }
)
Icon.displayName = "Icon"