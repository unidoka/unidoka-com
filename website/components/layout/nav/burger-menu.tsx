"use client";
// Burger menu built on the shared Sheet primitive. Slides in from the right
// on mobile and tablet (below the `md` breakpoint). Uses the same nav-link
// states as the desktop nav so the two stay in sync.
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { List } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ROUTES } from "@/utils/constants/routes";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";
import Logo from "@/components/layout/logo/logo";

export function BurgerMenu() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const pathname = usePathname();

  const links = [
    { href: ROUTES.projects.href, label: t("nav.projects") },
    { href: ROUTES.about.href, label: t("nav.about") },
    { href: ROUTES.blog.href, label: t("nav.blog") },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="text"
          size="icon-small"
          className="md:hidden"
          aria-label={t("nav.menu")}
        >
          <List className="size-6!" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[85vw] max-w-sm p-0 gap-0 flex flex-col"
      >
        <SheetHeader className="p-4 border-b border-(--outline) flex-row items-center justify-between">
          <SheetTitle className="sr-only">{t("nav.menu")}</SheetTitle>
          <Link href="/" onClick={() => setOpen(false)}>
            <Logo className="!h-8" />
          </Link>
        </SheetHeader>
        <nav className="flex-1 flex flex-col p-4 gap-1 overflow-y-auto">
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-2xl text-body-2 font-medium transition-colors",
                  isActive
                    ? "bg-(--primary-glass) text-(--primary)"
                    : "text-(--on-bg-high) hover:bg-(--state-hover)"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-(--outline)">
          <Button className="w-full" size="large" asChild>
            <Link href={ROUTES.order.href} onClick={() => setOpen(false)}>
              {t("nav.order")}
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
