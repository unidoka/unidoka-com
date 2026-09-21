"use client"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CheckIcon, InfoIcon, CircleNotchIcon, WarningIcon } from "@phosphor-icons/react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      closeButton={true}
      icons={{
        success: <CheckIcon className="size-4 [&>path]:fill-(--success)" />,
        info: <InfoIcon className="size-4 [&>path]:fill-blue-500" />,
        warning: <WarningIcon className="size-4 [&>path]:fill-(--warning)" />,
        error: <WarningIcon className="size-4 [&>path]:fill-(--error)" />,
        loading: <CircleNotchIcon className="size-4 animate-spin [&>path]:fill-primary" />,
      }}
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl group-[.toaster]:px-4 group-[.toaster]:py-4",
          title: "text-sm font-medium font-sans",
          description: "text-xs text-muted-foreground font-sans",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
