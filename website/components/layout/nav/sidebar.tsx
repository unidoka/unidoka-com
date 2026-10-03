"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
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
    } catch { }
  }, [storageKey]);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, next ? "1" : "0");
        } catch { }
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
    return <MobileTabs items={items} basePath={basePath} isItemActive={isItemActive} className={className} />;
  }

  return (
    <aside
      data-collapsed={isCollapsed ? "true" : "false"}
      className={cn(
        "h-fit rounded-3xl border border-(--outline) bg-(--card) shadow-md",
        "transition-[width,padding] duration-200 ease-in-out",
        isCollapsed ? "w-16 p-3" : "w-64 p-3",
        className,
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
                    "p-3",
                  )}
                  asChild
                >
                  <Link href={href}>
                    <Icon className="size-5 shrink-0" />
                    {!isCollapsed && <span className="text-sm">{item.label}</span>}
                  </Link>
                </Button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" sideOffset={8} className="hidden md:block">
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

/* ── Mobile horizontal tab strip ──────────────────────────────────── */

function MobileTabs({
  items,
  basePath,
  isItemActive,
  className,
}: {
  items: SidebarItem[];
  basePath: string;
  isItemActive: (href: string, item: SidebarItem) => boolean;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  // Scroll the active pill into view whenever the path changes. Uses
  // `scrollIntoView({ inline: "center" })` so the active tab lands in
  // the middle of the strip regardless of where it sits in the list -
  // a user landing on /admin/.../team sees "Team" centred, not parked
  // off the right edge where they'd have to swipe to find it.
  useEffect(() => {
    const el = activeRef.current;
    if (!el) return;
    // rAF defers until the browser has laid out the row, so the
    // measured width is correct on the first render.
    const id = requestAnimationFrame(() => {
      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    });
    return () => cancelAnimationFrame(id);
  }, [basePath]);

  return (
    <div
      className={cn(
        "relative w-full border-b border-(--outline) bg-(--card)",
        className,
      )}
    >
      {/* Fade edges so pills don't slam into the viewport walls - soft
          hint that the strip scrolls without adding chrome. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-6 z-10 bg-gradient-to-r from-(--card) to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-6 z-10 bg-gradient-to-l from-(--card) to-transparent"
      />

      <div
        ref={scrollRef}
        className={cn(
          "flex gap-1 px-4 py-2 whitespace-nowrap overflow-x-auto",
          // Hide the scrollbar on every engine:
          //   Webkit (Chrome/Safari/Edge) - pseudo-element
          //   Firefox                    - scrollbar-width
          //   IE/legacy Edge              - -ms-overflow-style
          "[&::-webkit-scrollbar]:hidden",
          "[scrollbar-width:none]",
          "[-ms-overflow-style:none]",
          // Momentum scrolling on iOS + touch-pan-x so horizontal
          // swipes don't bubble into the page's vertical scroll.
          "[-webkit-overflow-scrolling:touch] [touch-action:pan-x]",
        )}
      >
        {items.map((item) => {
          const href = `${basePath}${item.href}`;
          const isActive = isItemActive(href, item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={href}
              ref={isActive ? activeRef : undefined}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors shrink-0",
                isActive
                  ? "bg-(--primary-glass) text-(--primary)"
                  : "text-(--on-bg-medium) hover:bg-(--state-hover) hover:text-(--on-bg-high)",
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
