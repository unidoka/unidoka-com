"use client"
import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

/**
 * Switch primitive.
 *
 * Rewritten to guarantee visibility in both themes. The previous
 * version set the unchecked track to `bg-input` (→ --outline) and the
 * thumb to `bg-background` (→ --bg). In dark theme both resolve to
 * near-black on a near-black card, so the control read as two dead
 * dots — the exact failure mode visible in the admin user editor.
 *
 * The new colour contract pairs a translucent gray track with a solid
 * thumb whose colour flips with the track's state:
 *
 *   unchecked:  --on-bg-low at 40%  +  white/near-black thumb
 *   checked:    --primary           +  inverted thumb
 *
 * Both states are legible on light cards, dark cards, and any surface
 * in between. No dependency on --outline, --input, or --background —
 * each of which is theme-dependent and was the source of the bug.
 */
function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors outline-none",
        // Focus ring uses the brand colour, not the ring token — the
        // ring token was also theme-fragile on this surface.
        "focus-visible:ring-2 focus-visible:ring-(--primary)/40 focus-visible:ring-offset-0",
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Sizes: default 36×20, sm 28×16. Both have 2px inner padding.
        "data-[size=default]:h-5 data-[size=default]:w-9 data-[size=default]:p-[2px]",
        "data-[size=sm]:h-4 data-[size=sm]:w-7 data-[size=sm]:p-[2px]",
        // Track colour. Unchecked uses --on-bg-low at 40% — a
        // translucent gray that reads on any surface. Checked uses the
        // brand colour, which flips light/dark with the theme.
        "data-unchecked:bg-(--on-bg-low)/40",
        "data-checked:bg-(--primary)",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full shadow-sm ring-0 transition-transform",
          // Thumb size — 16px default, 12px small.
          "group-data-[size=default]/switch:size-4",
          "group-data-[size=sm]/switch:size-3",
          // Thumb colour. Always the inverse of the track so it's
          // visible regardless of state or theme.
          "bg-(--on-bg-high)",
          "data-checked:bg-(--on-primary)",
          // Slide distance. With p-[2px] and a 16px thumb on a 36px
          // track, remaining travel is 36 - 2 - 2 - 16 = 16px = tailwind-4.
          "group-data-[size=default]/switch:data-unchecked:translate-x-0",
          "group-data-[size=default]/switch:data-checked:translate-x-4",
          // sm: 28px track, 12px thumb, 2px padding → 28-2-2-12 = 12px = tailwind-3.
          "group-data-[size=sm]/switch:data-unchecked:translate-x-0",
          "group-data-[size=sm]/switch:data-checked:translate-x-3"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
