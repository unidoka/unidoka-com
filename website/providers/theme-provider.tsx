"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (theme: Theme) => void
} | null>(null)

export function ThemeProvider({ children, defaultTheme = "system" }: { children: React.ReactNode, defaultTheme?: Theme }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem("theme", newTheme);
    setThemeState(newTheme);
  };

  useEffect(() => {
    const root = window.document.documentElement

    const applyTheme = (currentTheme: Theme) => {
      root.classList.remove("light", "dark")

      if (currentTheme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        root.classList.add(systemTheme)
      } else {
        root.classList.add(currentTheme)
      }
    }

    applyTheme(theme)

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = () => applyTheme("system")

      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
