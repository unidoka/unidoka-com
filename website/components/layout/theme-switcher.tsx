"use client"
import { useTheme } from "@/providers/theme-provider"
import { Monitor, Sun, Moon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const options = [
    { value: "system", icon: Monitor, label: "Системная" },
    { value: "light", icon: Sun, label: "Светлая" },
    { value: "dark", icon: Moon, label: "Тёмная" },
  ] as const
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-(--outline) bg-(--card) p-0.5 w-fit h-9">
      {options.map((opt) => {
        const Icon = opt.icon
        const isActive = mounted && theme === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
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
                  ? "[&_path]:stroke-(--bg)"
                  : "[&_path]:stroke-(--on-bg-low) group-hover:[&_path]:stroke-(--on-bg-high)"
              )}
            />
            <span className="sr-only">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
