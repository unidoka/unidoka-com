"use client"
import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface CheckboxCardProps extends React.ComponentPropsWithoutRef<"label"> {
  checked?: boolean
  onCheckedChange?: (checked: boolean | "indeterminate") => void
}

/**
 * ponytail: Encapsulated Checkbox Card for premium form selection.
 * Minimalist utilitarian style with primary-glass background on selection.
 */
function CheckboxCard({
  checked,
  onCheckedChange,
  className,
  children,
  ...props
}: CheckboxCardProps) {
  return (
    <label
      className={cn(
        "flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer min-h-[72px] bg-transparent disabled:bg-input/50 dark:bg-input/30 dark:disabled:bg-input/80",
        checked
          ? "border-(--primary) ring-1 ring-(--primary)/30 bg-(--primary-glass)!"
          : "border-(--outline) hover:border-(--primary)",
        className
      )}
      {...props}
    >
      <Checkbox checked={checked} onCheckedChange={onCheckedChange} />
      <span className="text-body-4 font-medium leading-tight select-none flex-1">
        {children}
      </span>
    </label>
  )
}

export { CheckboxCard }
