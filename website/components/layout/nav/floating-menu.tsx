"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListIcon, X, User as UserIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/utils/constants/routes";
import { useLanguage } from "@/providers/language-provider";
import { useUser } from "@/entities/user/model/user-context";
import {
  rootDomainUrl,
  isAbsoluteUrl,
  crossSubdomainUrl,
} from "@/utils/root-domain";
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
  const { user, isLoading } = useUser();
  const pathname = usePathname();
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  const rootLink = (path: string) => rootDomainUrl(path);

  const links = [
    { href: rootLink(ROUTES.projects.href), label: t("nav.projects") },
    { href: rootLink(ROUTES.services.href), label: t("nav.services") },
    { href: rootLink(ROUTES.events.href), label: t("nav.events") },
    { href: rootLink(ROUTES.about.href), label: t("nav.about") },
    { href: rootLink(ROUTES.blog.href), label: t("nav.blog") },
  ];

  const loginHref = rootDomainUrl("/login");
  const registerHref = rootDomainUrl("/register");
  const loginIsAbsolute = isAbsoluteUrl(loginHref);
  const registerIsAbsolute = isAbsoluteUrl(registerHref);
  const profileHref = crossSubdomainUrl("app", "/profile");

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
            "fixed left-2 right-2 sm:left-auto sm:right-6 sm:w-96 z-[60]",
            "rounded-3xl border border-(--outline)",
            "bg-(--card) shadow-2xl p-2",
            "animate-in fade-in duration-200",
            position === "bottom"
              ? "bottom-32 slide-in-from-bottom-4"
              : "top-24 slide-in-from-top-4",
          )}
        >
          <nav className="flex flex-col">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "px-4 py-2.5 rounded-2xl text-body-2 font-medium transition-colors",
                    isActive
                      ? "bg-(--primary-glass) text-(--primary)"
                      : "text-(--on-bg-high) hover:bg-(--state-hover)",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          {/* Auth block only on mobile. On sm+ the header already renders
              Sign in / Sign up, so rendering them here duplicates them. */}
          {!isLoading && (
            <div className="mt-1.5 pt-2 border-t border-(--outline) sm:hidden">
              {user ? (
                <Button
                  variant="outlined"
                  size="large"
                  className="w-full"
                  asChild
                >
                  <Link
                    href={profileHref}
                    prefetch={false}
                    onClick={() => setOpen(false)}
                  >
                    <UserIcon className="size-4" />
                    {t("nav.profile")}
                  </Link>
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outlined" size="large" asChild>
                    {loginIsAbsolute ? (
                      <a href={loginHref} onClick={() => setOpen(false)}>
                        {t("nav.login")}
                      </a>
                    ) : (
                      <Link href={loginHref} onClick={() => setOpen(false)}>
                        {t("nav.login")}
                      </Link>
                    )}
                  </Button>
                  <Button size="large" asChild>
                    {registerIsAbsolute ? (
                      <a href={registerHref} onClick={() => setOpen(false)}>
                        {t("nav.register")}
                      </a>
                    ) : (
                      <Link href={registerHref} onClick={() => setOpen(false)}>
                        {t("nav.register")}
                      </Link>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
