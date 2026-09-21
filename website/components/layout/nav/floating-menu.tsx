"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListIcon, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/language-provider";
import { useHost } from "@/hooks/use-host";
import { buildNavLinks } from "@/utils/constants/nav-links";
import { NavItem } from "./nav-item";
import { cn } from "@/lib/utils";

interface FloatingMenuProps {
  position?: "top" | "bottom";
  triggerClassName?: string;
  triggerSize?: React.ComponentProps<typeof Button>["size"];
  triggerShape?: React.ComponentProps<typeof Button>["shape"];
  triggerIconClassName?: string;
}

export function FloatingMenu({
  position = "bottom",
  triggerClassName,
  triggerSize = "icon-small",
  triggerShape = "square",
  triggerIconClassName,
}: FloatingMenuProps) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const { subdomain } = useHost();
  const pathname = usePathname();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const links = buildNavLinks(subdomain);
  const bare = (pathname ?? "").split("#")[0];

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const el = wrapperRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="contents">
      <Button
        variant="text"
        shape={triggerShape}
        size={triggerSize}
        className={triggerClassName}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="floating-menu-panel"
        aria-label={t("nav.menu")}
      >
        {open ? (
          <X className={triggerIconClassName} />
        ) : (
          <ListIcon className={triggerIconClassName} />
        )}
      </Button>

      {open && (
        <div
          id="floating-menu-panel"
          className={cn(
            "fixed left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-[60]",
            "rounded-3xl border border-(--outline)",
            "bg-(--card) shadow-2xl p-3",
            "animate-in fade-in duration-200",
            position === "bottom"
              ? "bottom-36 slide-in-from-bottom-4"
              : "top-24 slide-in-from-top-4"
          )}
        >
          <nav className="flex flex-col">
            {links.map((link) => {
              const isActive =
                !link.dialog &&
                !link.target &&
                !link.path?.includes("#") &&
                (bare === link.path ||
                  (link.path !== "/" &&
                    link.path !== undefined &&
                    bare.startsWith(link.path)));

              return (
                <NavItem
                  key={link.label}
                  item={link}
                  variant="panel"
                  active={isActive}
                  onNavigate={() => setOpen(false)}
                />
              );
            })}
          </nav>

          {subdomain === "site" && (
            <div className="mt-2 pt-3 border-t border-(--outline)">
              <Button className="w-full" size="large" asChild>
                <Link href="/order" onClick={() => setOpen(false)}>
                  {t("nav.order")}
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
