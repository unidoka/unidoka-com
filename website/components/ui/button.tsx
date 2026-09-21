"use client"

/* LLM context: Forcing SVG internal paths to inherit current color in Button components to fix dark icons on primary buttons in light theme */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
export const buttonUnidekaVariants = {
  filled: "bg-[image:var(--primary-gradient)] text-[var(--on-primary)] cursor-pointer [&_svg]:text-current",
  outlined: "border border-border bg-transparent text-foreground [&_svg]:text-current",
  tonal: "bg-[var(--primary-card)] text-[var(--on-primary-card)] [&_svg]:text-current",
  "tonal-card": "bg-card text-card-foreground border border-border/50 [&_svg]:text-current",
  "tonal-primary": "bg-[var(--primary-card)] text-primary [&_svg]:text-current",
  text: "bg-transparent text-foreground [&_svg]:text-current",
  glass: "bg-[var(--primary-glass)] backdrop-blur-[var(--blur-glass)] border border-[var(--outline-primary-glass)] text-primary [&_svg]:text-current",
  selected: "bg-[var(--primary-card)] text-primary border border-primary cursor-pointer [&_svg]:text-current",
};
export const chipSizes = {
  "chip-small": "h-[28px] px-3 [&_svg]:size-3.5 text-body-5!",
  "chip-medium": "h-[36px] px-4 [&_svg]:size-4 text-body-4!",
  "chip-large": "h-[46px] px-6 [&_svg]:size-5 text-body-3!",
  "chip-xlarge": "h-[58px] px-8 [&_svg]:size-6 text-body-2!",
}
export const iconButtonSizes = {
  "icon-xsmall": "h-[24px] aspect-square [&_svg]:size-[24px]",
  "icon-small": "h-[36px] aspect-square [&_svg]:size-[24px]",
  "icon-medium": "h-[42px] aspect-square [&_svg]:size-[30px]",
  "icon-large": "h-[54px] aspect-square [&_svg]:size-[36px]",
  "icon-xlarge": "h-[64px] aspect-square [&_svg]:size-[36px]",
}
export const buttonSizes = {
  xsmall: "h-[24px] px-4 text-xs gap-1 [&_svg]:size-3 text-heading-6!",
  small: "h-[36px] px-4 text-xs gap-1 [&_svg]:size-3.5 text-heading-6!",
  medium: "h-[42px] px-6 gap-1.5 [&_svg]:size-4 text-heading-5!",
  large: "h-[54px] px-6 gap-2 [&_svg]:size-5 text-heading-4!",
  xlarge: "h-[64px] px-6 gap-2 [&_svg]:size-6 text-heading-3!",
}
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-[var(--state-focus)]/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: buttonUnidekaVariants,
      size: {
        ...buttonSizes,
        ...iconButtonSizes,
        ...chipSizes,
      },
      shape: {
        square: "rounded-xl",
        round: "rounded-full",
      }
    },
    defaultVariants: {
      variant: "filled",
      size: "medium",
      shape: "square",
    },
  }
)
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean,
  ref?: any,
}
function Button({
  className,
  variant,
  size,
  shape,
  asChild = false,
  ref,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      ref={ref}
      data-slot="button"
      className={cn("relative after:absolute after:inset-0 after:bg-(--state-hover) after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-200 overflow-hidden active:scale-[0.98]", buttonVariants({ variant, size, shape, className }))}
      {...props}
    />
  )
}
export { Button, buttonVariants }
