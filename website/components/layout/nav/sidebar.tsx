"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { SidebarSimpleIcon, SidebarIcon } from "@phosphor-icons/react";
export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}
interface SidebarProps {
  items: SidebarItem[];
  basePath: string;
  title?: string;
  className?: string;
  footer?: ReactNode;
  collapsible?: boolean;
  storageKey?: string;
}
export function Sidebar({
  items,
  basePath,
  title = "Меню",
  className,
  footer,
  collapsible = true,
  storageKey,
}: SidebarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  useEffect(() => {
    if (!storageKey) return;
    try {
      if (localStorage.getItem(storageKey) === "1") setIsCollapsed(true);
    } catch {}
  }, [storageKey]);
  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, next ? "1" : "0");
        } catch {}
      }
      return next;
    });
  };
  const path = pathname.replace(/\/+$/, "") || "/";
  const isItemActive = (href: string, item: SidebarItem): boolean => {
    if (item.exact) return path === href;
    return path === href || path.startsWith(href + "/");
  };
  if (isMobile) {
    return (
      <div
        className={cn(
          "w-full overflow-x-auto py-2 border-b border-(--outline) bg-(--card)",
          "[&::-webkit-scrollbar]:hidden",
          className
        )}
      >
        <div className="flex gap-1 px-4 whitespace-nowrap">
          {items.map((item) => {
            const href = `${basePath}${item.href}`;
            const isActive = isItemActive(href, item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors",
                  isActive
                    ? "bg-(--primary-glass) text-(--primary)"
                    : "text-(--on-bg-medium) hover:bg-(--state-hover)"
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <aside
      data-collapsed={isCollapsed ? "true" : "false"}
      className={cn(
        "h-fit rounded-3xl border border-(--outline) bg-(--card) shadow-md",
        "transition-[width,padding] duration-200 ease-in-out",
        isCollapsed ? "w-16 p-3" : "w-64 p-3",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-(--outline)">
        {!isCollapsed && (
          <h2 className="text-heading-3 tracking-tight truncate">{title}</h2>
        )}
        {collapsible && (
          <Button
            variant="text"
            size="icon-small"
            onClick={toggleCollapsed}
            className={cn(isCollapsed ? "mx-auto" : "ml-4")}
            aria-label={isCollapsed ? "Развернуть" : "Свернуть"}
          >
            {isCollapsed ? (
              <SidebarSimpleIcon className="size-4" />
            ) : (
              <SidebarIcon className="size-4" />
            )}
          </Button>
        )}
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const href = `${basePath}${item.href}`;
          const isActive = isItemActive(href, item);
          const Icon = item.icon;
          return (
            <Tooltip
              key={item.href}
              delayDuration={0}
              disableHoverableContent={!isCollapsed}
            >
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? "glass" : "text"}
                  className={cn(
                    isCollapsed ? "justify-center" : "justify-start",
                    "p-3"
                  )}
                  asChild
                >
                  <Link href={href}>
                    <Icon className="size-5 shrink-0" />
                    {!isCollapsed && (
                      <span className="text-sm">{item.label}</span>
                    )}
                  </Link>
                </Button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent
                  side="right"
                  sideOffset={8}
                  className="hidden md:block"
                >
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </nav>
      {footer && !isCollapsed && (
        <div className="mt-4 pt-3 border-t border-(--outline)">{footer}</div>
      )}
    </aside>
  );
}
