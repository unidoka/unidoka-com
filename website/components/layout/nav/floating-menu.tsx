"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListIcon, X } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/language-provider";
import { rootDomainUrl } from "@/utils/root-domain";
import { cn } from "@/lib/utils";

const MENU_LINKS = [
  { href: "/events", labelKey: "nav.events", fallback: "События" },
  { href: "/solutions", labelKey: "nav.solutions", fallback: "Решения" },
  { href: "/amorfa", labelKey: "nav.amorfa", fallback: "Amorfa" },
  { href: "/docs", labelKey: "nav.docs", fallback: "Документы" },
];

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
  const pathname = usePathname();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Handle outside clicks
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const el = wrapperRef.current;
      const drop = dropdownRef.current;
      if (!el || !drop) return;
      if (el.contains(e.target as Node) || drop.contains(e.target as Node)) return;
      setOpen(false);
    };
    const timeout = setTimeout(() => {
      document.addEventListener("mousedown", onDown);
      document.addEventListener("touchstart", onDown);
    }, 10);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  const rootLink = (path: string) => rootDomainUrl(path);

  const tr = (key: string, fallback: string) => {
    const v = t(key);
    return v === key ? fallback : v;
  };

  return (
    <div ref={wrapperRef} className="relative flex items-center">
      <Button
        variant="text"
        shape={triggerShape}
        size={triggerSize}
        className={cn(triggerClassName)}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="floating-menu-panel"
      >
        {open ? (
          <X className={triggerIconClassName} />
        ) : (
          <ListIcon className={triggerIconClassName} />
        )}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="floating-menu-panel"
            ref={dropdownRef}
            initial={{ opacity: 0, y: position === "bottom" ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: position === "bottom" ? 10 : -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "absolute z-[9999] flex flex-col border border-[color-mix(in_srgb,var(--outline),transparent_50%)] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.15)] backdrop-blur-2xl bg-[color-mix(in_srgb,var(--card),transparent_85%)] w-64 max-w-[calc(100vw-3rem)] rounded-2xl p-2",
              position === "bottom"
                ? "bottom-full right-0 mb-3"
                : "top-full right-0 mt-3"
            )}
          >
            <nav className="flex flex-col gap-1">
              {MENU_LINKS.map((link) => {
                const href = rootLink(link.href);
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block px-4 py-3 rounded-xl text-[15px] font-medium text-center transition-colors",
                      isActive
                        ? "bg-(--primary-glass) text-(--primary)"
                        : "text-(--on-bg-high) hover:bg-(--state-hover)"
                    )}
                  >
                    {tr(link.labelKey, link.fallback)}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
