"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface NavLinkProps extends React.ComponentPropsWithoutRef<typeof Link> {
  activeClassName?: string
  inactiveClassName?: string
}

export function NavLink({
  href,
  className,
  activeClassName = "bg-accent text-accent-foreground",
  inactiveClassName = "text-(--on-bg-high) hover:text-foreground hover:bg-transparent",
  ...props
}: NavLinkProps) {
  const pathname = usePathname()

  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href.toString()))

  return (
    <Link
      href={href}
      className={cn(
        "transition-all duration-200",
        isActive ? activeClassName : inactiveClassName,
        className
      )}
      {...props}
    />
  )
}
