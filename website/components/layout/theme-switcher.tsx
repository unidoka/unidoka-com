"use client"
import { useTheme } from "@/providers/theme-provider"
import { DesktopIcon, SunIcon, MoonIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const options = [
    { value: "system", icon: DesktopIcon, label: "Системная" },
    { value: "light", icon: SunIcon, label: "Светлая" },
    { value: "dark", icon: MoonIcon, label: "Тёмная" },
  ] as const
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-(--outline) bg-(--card) p-0.5 w-fit h-9">
      {options.map((opt) => {
        const Icon = opt.icon
        const isActive = mounted && theme === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            aria-label={opt.label}
            aria-pressed={isActive}
            className={cn(
              "group relative flex size-8 items-center justify-center rounded-full transition-all duration-200 outline-none cursor-pointer",
              isActive
                ? "bg-(--on-bg-high) shadow-sm"
                : "hover:bg-(--state-hover)"
            )}
          >
            <Icon
              className={cn(
                "size-4! transition-colors",
                isActive
                  ? "[&_path]:fill-(--bg) [&_circle]:fill-(--bg)"
                  : "[&_path]:fill-(--on-bg-low) [&_circle]:fill-(--on-bg-low) group-hover:[&_path]:fill-(--on-bg-high) group-hover:[&_circle]:fill-(--on-bg-high)"
              )}
            />
            <span className="sr-only">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
