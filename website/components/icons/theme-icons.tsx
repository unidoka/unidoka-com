import * as React from "react";
import { cn } from "@/lib/utils";

interface ThemeIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

const base = (className: string | undefined) =>
  cn("shrink-0", className);

export const SystemThemeIcon = React.forwardRef<SVGSVGElement, ThemeIconProps>(
  ({ className, size = 24, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={base(className)}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-4v2h1a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2h1v-2H6a2 2 0 0 1-2-2V5zm2 0v9h12V5H6z"
      />
    </svg>
  )
);
SystemThemeIcon.displayName = "SystemThemeIcon";

export const SunIcon = React.forwardRef<SVGSVGElement, ThemeIconProps>(
  ({ className, size = 24, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={base(className)}
      {...props}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M11 1h2v4h-2V1zM11 19h2v4h-2v-4zM1 11h4v2H1v-2zM19 11h4v2h-4v-2z" />
      <path d="M4.22 5.64 5.64 4.22l2.83 2.83-1.42 1.41zM15.54 16.95l1.41-1.42 2.83 2.83-1.42 1.42zM5.64 19.78l-1.42-1.41 2.83-2.83 1.41 1.42zM16.95 8.46l-1.41-1.41 2.83-2.83 1.41 1.41z" />
    </svg>
  )
);
SunIcon.displayName = "SunIcon";

export const NightIcon = React.forwardRef<SVGSVGElement, ThemeIconProps>(
  ({ className, size = 24, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={base(className)}
      {...props}
    >
      <path d="M21.53 15.29A9.05 9.05 0 0 1 12.5 21 9 9 0 0 1 3 12.5a9.05 9.05 0 0 1 5.71-9.03 1 1 0 0 1 1.28 1.27A7 7 0 0 0 19.26 14a1 1 0 0 1 1.27 1.29z" />
    </svg>
  )
);
NightIcon.displayName = "NightIcon";
