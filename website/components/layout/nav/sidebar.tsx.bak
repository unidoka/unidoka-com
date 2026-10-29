"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  CaretDown,
  SidebarSimpleIcon,
  SidebarIcon,
} from "@phosphor-icons/react";

export interface SidebarSubItem {
  label: string;
  href: string;
  exact?: boolean;
}

export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  /** Nested links rendered indented below the parent. The parent row
   *  carries a separate caret button that toggles their visibility;
   *  clicking the label still navigates to `href`. */
  children?: SidebarSubItem[];
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

/** Extract the path portion of an href.
 *
 *  The admin sidebar builds hrefs with crossSubdomainUrl(), which
 *  returns a full URL in subdomain mode (`https://admin.x/y`) and a
 *  bare path in path mode (`/admin/x/y`). usePathname() always returns
 *  the browser-visible path — the internal rewrite done by proxy.ts is
 *  invisible to it. Comparing `https://…` to `/…` never matches, so
 *  strip the origin first. */
function toPath(href: string): string {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    try {
      return new URL(href).pathname;
    } catch {
      return href;
    }
  }
  return href;
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
  // Per-group expansion. Keyed by the group's `href` so a group's
  // state survives reordering. Empty object on first render — the
  // `isGroupExpanded` helper defaults to "open if it contains the
  // current route, else closed", so only the relevant group starts
  // open without needing an effect to figure that out.
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );

  // Restore both the whole-sidebar collapse and per-group expansion
  // from localStorage.
  useEffect(() => {
    if (!storageKey) return;
    try {
      if (localStorage.getItem(storageKey) === "1") setIsCollapsed(true);
      const rawGroups = localStorage.getItem(`${storageKey}-groups`);
      if (rawGroups) setExpandedGroups(JSON.parse(rawGroups));
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

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      // Read the current effective value (which may be the default),
      // flip it, and persist the explicit choice.
      const next = { ...prev, [key]: !isGroupExpandedRaw(key, prev) };
      if (storageKey) {
        try {
          localStorage.setItem(
            `${storageKey}-groups`,
            JSON.stringify(next),
          );
        } catch {}
      }
      return next;
    });
  };

  const currentPath = pathname.replace(/\/+$/, "") || "/";

  const isActive = (href: string, exact?: boolean): boolean => {
    const target = toPath(`${basePath}${href}`);
    if (exact) return currentPath === target;
    return currentPath === target || currentPath.startsWith(target + "/");
  };

  // Resolve a group's expansion state: explicit user choice wins,
  // otherwise default to "open if the current page is one of its
  // children." `overrides` lets the toggle handler read the same
  // resolution before mutating.
  const isGroupExpandedRaw = (
    href: string,
    overrides: Record<string, boolean>,
  ): boolean => {
    if (href in overrides) return overrides[href];
    const item = items.find((i) => i.href === href);
    if (!item?.children) return false;
    return item.children.some((c) => isActive(c.href, c.exact));
  };

  const isGroupExpanded = (item: SidebarItem): boolean =>
    isGroupExpandedRaw(item.href, expandedGroups);

  if (isMobile) {
    // Flatten the tree into one horizontal strip. Children reuse the
    // parent's icon — on a 40px-tall pill, icon variety is noise.
    const flat: MobileTab[] = [];
    for (const item of items) {
      flat.push({
        label: item.label,
        href: item.href,
        icon: item.icon,
        exact: item.exact,
      });
      for (const child of item.children ?? []) {
        flat.push({
          label: child.label,
          href: child.href,
          icon: item.icon,
          exact: child.exact,
        });
      }
    }
    return (
      <MobileTabs
        items={flat}
        basePath={basePath}
        isActive={isActive}
        className={className}
      />
    );
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

      <nav className="flex flex-col gap-0.5">
        {items.map((item) => {
          const selfActive = isActive(item.href, item.exact);
          const childActive = (item.children ?? []).some((c) =>
            isActive(c.href, c.exact),
          );
          const groupActive = selfActive || childActive;
          const Icon = item.icon;
          const hasChildren = (item.children ?? []).length > 0;
          const expanded = isGroupExpanded(item);

          return (
            <div key={item.href} className="flex flex-col">
              <div
                className={cn(
                  "flex items-stretch rounded-xl transition-colors",
                  groupActive
                    ? "bg-(--primary-glass)"
                    : "hover:bg-(--state-hover)",
                )}
              >
                {/* Label row — navigates. `min-w-0` lets the label
                    truncate when the sidebar is narrow. */}
                <Tooltip
                  delayDuration={0}
                  disableHoverableContent={!isCollapsed}
                >
                  <TooltipTrigger asChild>
                    <Link
                      href={`${basePath}${item.href}`}
                      className={cn(
                        "flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-3 py-2.5",
                        groupActive
                          ? "text-(--primary)"
                          : "text-(--on-bg-high)",
                      )}
                    >
                      <Icon className="size-5 shrink-0" />
                      {!isCollapsed && (
                        <span className="text-sm truncate">{item.label}</span>
                      )}
                    </Link>
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

                {/* Caret — a separate hit target so the row can be both
                    "navigate" and "expand" without ambiguity. Hidden
                    when the sidebar is fully collapsed (icons-only
                    mode); the child list is hidden there too, so the
                    caret would have nothing to toggle. */}
                {hasChildren && !isCollapsed && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleGroup(item.href);
                    }}
                    aria-label={expanded ? "Свернуть группу" : "Развернуть группу"}
                    aria-expanded={expanded}
                    className={cn(
                      "flex w-8 shrink-0 items-center justify-center rounded-xl",
                      "text-(--on-bg-low) transition-colors",
                      "hover:text-(--on-bg-high)",
                      groupActive && "text-(--primary)",
                    )}
                  >
                    <CaretDown
                      className={cn(
                        "size-3.5 transition-transform duration-150",
                        expanded && "rotate-180",
                      )}
                      weight="bold"
                    />
                  </button>
                )}
              </div>

              {!isCollapsed && hasChildren && expanded && (
                <ul className="ml-4 mt-1 pl-3 border-l border-(--outline) flex flex-col gap-0.5">
                  {item.children!.map((child) => {
                    const active = isActive(child.href, child.exact);
                    return (
                      <li key={child.href}>
                        <Link
                          href={`${basePath}${child.href}`}
                          className={cn(
                            "block px-2.5 py-1.5 rounded-md text-[13px] leading-snug transition-colors",
                            active
                              ? "bg-(--primary-glass) text-(--primary) font-medium"
                              : "text-(--on-bg-medium) hover:text-(--on-bg-high) hover:bg-(--state-hover)",
                          )}
                        >
                          {child.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      {footer && !isCollapsed && (
        <div className="mt-4 pt-3 border-t border-(--outline)">{footer}</div>
      )}
    </aside>
  );
}

/* ── Mobile horizontal tab strip ─────────────────────────────────── */
interface MobileTab {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

function MobileTabs({
  items,
  basePath,
  isActive,
  className,
}: {
  items: MobileTab[];
  basePath: string;
  isActive: (href: string, exact?: boolean) => boolean;
  className?: string;
}) {
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = activeRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    });
    return () => cancelAnimationFrame(id);
  });

  return (
    <div
      className={cn(
        "relative w-full border-b border-(--outline) bg-(--card)",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-6 z-10 bg-gradient-to-r from-(--card) to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-6 z-10 bg-gradient-to-l from-(--card) to-transparent"
      />
      <div
        className={cn(
          "flex gap-1 px-4 py-2 whitespace-nowrap overflow-x-auto",
          "[&::-webkit-scrollbar]:hidden",
          "[scrollbar-width:none]",
          "[-ms-overflow-style:none]",
          "[-webkit-overflow-scrolling:touch] [touch-action:pan-x]",
        )}
      >
        {items.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={`${basePath}${item.href}`}
              ref={active ? activeRef : undefined}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors shrink-0",
                active
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
