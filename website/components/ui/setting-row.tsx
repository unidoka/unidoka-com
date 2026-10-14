"use client"

import * as React from "react"
import { LockIcon } from "@phosphor-icons/react"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

/**
 * One row in a settings panel.
 *
 * Three visual shapes, all sharing a layout so a group of rows reads
 * as one block:
 *
 *   toggle    — icon, label, description, switch on the right
 *   locked    — same, but a lock icon replaces the switch and the
 *               row is visually muted. Used for things the user
 *               cannot change (transactional/legal email).
 *   static    — no control at all. Used for informational rows.
 *
 * The `disabled` prop on a toggle row is distinct from `locked`: a
 * disabled toggle shows the switch greyed out, meaning "this could be
 * changed but isn't right now" (e.g. a topic when no channel is on).
 * Locked means "this can never be changed".
 */
interface SettingRowProps {
  icon?: React.ComponentType<{ className?: string; weight?: "regular" | "bold" | "fill" | "duotone" }>
  label: string
  description?: string
  /** Toggle mode — pass both. */
  checked?: boolean
  onCheckedChange?: (v: boolean) => void
  /** Locked mode — replaces the switch with a lock indicator. */
  locked?: boolean
  /** Toggle is present but not interactive right now. */
  disabled?: boolean
  /** Optional right-aligned addendum shown after the switch. */
  meta?: React.ReactNode
  className?: string
}

export function SettingRow({
  icon: Icon,
  label,
  description,
  checked,
  onCheckedChange,
  locked,
  disabled,
  meta,
  className,
}: SettingRowProps) {
  const isToggle = !locked && typeof checked === "boolean"
  const rowId = React.useId()

  return (
    <div
      className={cn(
        "flex items-center gap-4 py-3.5 first:pt-0 last:pb-0",
        locked && "opacity-70",
        className,
      )}
    >
      {Icon && (
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl",
            locked
              ? "bg-(--bg-disabled) text-(--on-bg-low)"
              : "bg-(--primary-card) text-(--primary)",
          )}
        >
          <Icon className="size-4" weight="regular" />
        </span>
      )}

      <div className="flex-1 min-w-0">
        <label
          htmlFor={isToggle ? rowId : undefined}
          className={cn(
            "block text-body-3 font-medium leading-snug",
            locked ? "text-(--on-bg-medium)" : "text-(--on-bg-high)",
            isToggle && !disabled && "cursor-pointer",
          )}
        >
          {label}
        </label>
        {description && (
          <p className="text-body-5 text-(--on-bg-low) leading-snug mt-0.5">
            {description}
          </p>
        )}
      </div>

      {meta && <div className="shrink-0">{meta}</div>}

      {locked && (
        <span
          className="flex size-6 shrink-0 items-center justify-center text-(--on-bg-low)"
          title="Обязательно"
        >
          <LockIcon className="size-4" weight="regular" />
        </span>
      )}

      {isToggle && (
        <Switch
          id={rowId}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          aria-label={label}
        />
      )}
    </div>
  )
}
