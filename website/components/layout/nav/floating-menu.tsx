"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListIcon, X } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/language-provider";
import { rootDomainUrl } from "@/utils/root-domain";
import { cn } from "@/lib/utils";
import { AmorfaLogo } from "@/components/icons/logotypes/amorfa-logo";
import { VershinyLogo } from "@/components/icons/logotypes/vershiny-logo";

interface MenuLink {
  href: string;
  labelKey: string;
  fallback: string;
  icon?: ReactNode;
}

const MENU_LINKS: MenuLink[] = [
  { href: "/events", labelKey: "nav.events", fallback: "События" },
  { href: "/solutions", labelKey: "nav.solutions", fallback: "Решения" },
  { 
    href: "/amorfa", 
    labelKey: "nav.amorfa", 
    fallback: "Amorfa",
    icon: <AmorfaLogo className="size-4 shrink-0" />
  },
  { 
    href: "/vershiny_top", 
    labelKey: "nav.vershiny", 
    fallback: "Вершины",
    icon: <VershinyLogo className="size-4 shrink-0" />
  },
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

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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

  const menuVariants = {
    hidden: { opacity: 0, y: position === "bottom" ? 8 : -8, scale: 0.96, originY: position === "bottom" ? 1 : 0 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };
  const premiumSpring = { type: "spring", stiffness: 400, damping: 30, mass: 0.7 };

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
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={premiumSpring}
            className={cn(
              "absolute z-[9999] flex flex-col border border-(--outline) shadow-[0_16px_40px_-12px_rgba(0,0,0,0.15)] bg-card w-64 max-w-[calc(100vw-3rem)] rounded-2xl p-2",
              position === "bottom"
                ? "bottom-full right-0 mb-4 origin-bottom-right"
                : "top-full right-0 mt-4 origin-top-right"
            )}
          >
            <div
              className={cn(
                "absolute right-[18px] w-3 h-3 rotate-45 bg-card border-(--outline)",
                position === "bottom"
                  ? "-bottom-1.5 border-b border-r"
                  : "-top-1.5 border-t border-l"
              )}
            />

            <nav className="relative z-10 flex flex-col gap-1">
              {MENU_LINKS.map((link) => {
                const href = rootLink(link.href);
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[15px] font-medium text-center transition-colors",
                      isActive
                        ? "bg-(--primary-glass) text-(--primary)"
                        : "text-(--on-bg-high) hover:bg-(--state-hover)"
                    )}
                  >
                    {link.icon}
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
