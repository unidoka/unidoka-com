"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/layout/logo/logo";
import { Button } from "@/components/ui/button";
import { NavLink } from "./nav-link";
import { User, CaretLeftIcon } from "@phosphor-icons/react";
import { useUser } from "@/entities/user/model/user-context";
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminSecret } from "@/hooks/use-admin-secret";
import { useRootHref } from "@/hooks/use-root-href";
import { crossSubdomainUrl, rootDomainUrl } from "@/utils/root-domain";
import { useLanguage } from "@/providers/language-provider";
import { FloatingMenu } from "./floating-menu";
import { CycleText } from "./cycle-text";
import { QuickOrderDialog } from "@/components/ui/quick-order-dialog";
import { TelemostStackIcon } from "@/components/icons/telemost-stack-icon";
import { Container } from "@/components/ui/container";

const NAV_LINKS = [
  { href: "/events", labelKey: "nav.events", fallback: "События" },
  { href: "/solutions", labelKey: "nav.solutions", fallback: "Решения" },
  { href: "/amorfa", labelKey: "nav.amorfa", fallback: "Amorfa" },
  { href: "/docs", labelKey: "nav.docs", fallback: "Документы" },
];

const BACK_MAP: Record<string, { href: string; labelKey: string; fallback: string }> = {
  events: { href: "/events", labelKey: "nav.events", fallback: "События" },
  solutions: { href: "/solutions", labelKey: "nav.solutions", fallback: "Решения" },
  docs: { href: "/docs", labelKey: "nav.docs", fallback: "Документы" },
};

function useBackTarget() {
  const pathname = usePathname() || "";
  const { t } = useLanguage();
  return useMemo(() => {
    const segs = pathname.split("/").filter(Boolean);
    if (segs.length < 2) return null;
    const entry = BACK_MAP[segs[0]];
    if (!entry) return null;
    const v = t(entry.labelKey);
    return {
      href: entry.href,
      label: v === entry.labelKey ? entry.fallback : v,
    };
  }, [pathname, t]);
}

export default function Header() {
  const { user, isLoading, logout } = useUser();
  const { t } = useLanguage();
  const logoHref = useRootHref();
  const back = useBackTarget();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) return;
    const onDown = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [profileOpen]);

  const { secret: adminSecret } = useAdminSecret();
  
  const adminHref = adminSecret
    ? crossSubdomainUrl("admin", `/${adminSecret}`)
    : null;
  const profileHref = crossSubdomainUrl("app", "/profile");
  const rootLink = (path: string) => rootDomainUrl(path);

  const shadowStyle = isScrolled
    ? { boxShadow: "0 12px 32px -8px rgba(0,0,0,0.12), 0 4px 12px -4px rgba(0,0,0,0.04)" }
    : { boxShadow: "0 6px 20px -6px rgba(0,0,0,0.08), 0 2px 8px -2px rgba(0,0,0,0.02)" };

  const navLinkClass = "inline-flex items-center h-8 px-2.5 text-[13px] leading-none whitespace-nowrap transition-colors";
  const navActiveClass = "text-(--on-bg-high) font-medium";
  const navInactiveClass = "text-(--on-bg-medium) hover:text-(--on-bg-high)";

  const tr = (key: string, fallback: string) => {
    const v = t(key);
    return v === key ? fallback : v;
  };

  // Premium, smooth spring animation
  const profileVariants = {
    hidden: { opacity: 0, y: -8, scale: 0.96, originY: 0 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };
  const premiumSpring = { type: "spring", stiffness: 400, damping: 30, mass: 0.7 };

  return (
    <header className="sticky top-0 left-0 right-0 z-50 w-full px-3 pt-3 pointer-events-none">
      <div className="mx-auto max-w-7xl w-full pointer-events-auto">
        <Container className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_1fr] items-center justify-center gap-3">
          
          {/* Left: Back Button */}
          <div className="hidden sm:flex min-w-0 items-center">
            <AnimatePresence initial={false}>
              {back && (
                <motion.div
                  key={back.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Button
                    variant="tonal-card"
                    size="small"
                    shape="square"
                    asChild
                    className="h-12! gap-1.5 pl-4 pr-5 rounded-2xl border-none bg-card"
                    style={shadowStyle}
                  >
                    <Link href={back.href}>
                      <CaretLeftIcon className="size-4" weight="bold" />
                      <span className="text-[13px] font-medium truncate max-w-[120px]">
                        {back.label}
                      </span>
                    </Link>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Center: Main Dock */}
          <div
            className="bg-card mx-auto flex items-center h-12 w-fit pl-5 pr-2 rounded-2xl gap-2 transition-shadow duration-300"
            style={shadowStyle}
          >
            <Link href={logoHref} className="inline-flex items-center">
              <motion.span
                initial={{ opacity: 0, scale: 0.82, filter: "blur(6px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{
                  duration: 0.9,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.12,
                }}
                className="inline-flex items-center"
              >
                <Logo className="!h-5" />
              </motion.span>
            </Link>
            
            <nav className="hidden lg:flex items-center h-8 ml-2">
              {NAV_LINKS.map((item) => (
                <NavLink
                  key={item.href}
                  href={rootLink(item.href)}
                  className={navLinkClass}
                  activeClassName={navActiveClass}
                  inactiveClassName={navInactiveClass}
                >
                  {tr(item.labelKey, item.fallback)}
                </NavLink>
              ))}
            </nav>

            {isLoading ? (
              <Skeleton className="size-9 rounded-xl ml-1" />
            ) : (
              <div className="relative ml-1" ref={profileRef}>
                <Button
                  variant="text"
                  size="icon-small"
                  shape="square"
                  className="size-9 rounded-xl hover:bg-(--state-hover) transition-colors"
                  onClick={() => setProfileOpen((v) => !v)}
                >
                  <User className="size-[18px]" />
                </Button>
                
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      variants={profileVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      transition={premiumSpring}
                      className="absolute top-full right-0 mt-4 w-[260px] sm:w-64 rounded-2xl border border-(--outline) bg-card p-2 flex flex-col gap-1 z-[9999] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.15)] origin-top-right"
                    >
                      {/* Pointer (Always aligned with center of icon) */}
                      <div className="absolute -top-1.5 right-[18px] w-3 h-3 rotate-45 bg-card border-t border-l border-(--outline)" />
                      
                      <div className="relative z-10 flex flex-col gap-1">
                        {user ? (
                          <>
                            <Link
                              href={profileHref}
                              prefetch={false}
                              onClick={() => setProfileOpen(false)}
                              className="block px-4 py-3 rounded-xl text-[15px] font-medium text-center text-(--on-bg-high) hover:bg-(--state-hover) transition-colors"
                            >
                              {tr("nav.profile", "Профиль")}
                            </Link>
                            {(user?.role === "admin" || user?.role === "root") && adminHref && (
                              <Link
                                href={adminHref}
                                onClick={() => setProfileOpen(false)}
                                className="block px-4 py-3 rounded-xl text-[15px] font-medium text-center text-(--on-bg-high) hover:bg-(--state-hover) transition-colors"
                              >
                                {tr("nav.admin", "Админ-панель")}
                              </Link>
                            )}
                            <button
                              onClick={() => {
                                logout();
                                setProfileOpen(false);
                              }}
                              className="block w-full px-4 py-3 rounded-xl text-[15px] font-medium text-center text-(--on-bg-high) hover:bg-(--state-hover) transition-colors"
                            >
                              {tr("nav.logout", "Выйти")}
                            </button>
                          </>
                        ) : (
                          <>
                            <Link
                              href={rootLink("/login")}
                              onClick={() => setProfileOpen(false)}
                              className="block px-4 py-3 rounded-xl text-[15px] font-medium text-center text-(--on-bg-high) hover:bg-(--state-hover) transition-colors"
                            >
                              {tr("nav.login", "Войти")}
                            </Link>
                            <Link
                              href={rootLink("/register")}
                              onClick={() => setProfileOpen(false)}
                              className="block px-4 py-3 rounded-xl text-[15px] font-medium text-center text-(--on-bg-high) hover:bg-(--state-hover) transition-colors"
                            >
                              {tr("nav.register", "Регистрация")}
                            </Link>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="hidden sm:flex lg:hidden ml-1">
              <FloatingMenu position="top" />
            </div>
          </div>

          {/* Right: CTA */}
          <div className="hidden sm:flex min-w-0 justify-end">
            <QuickOrderDialog serviceName="Консультация">
              <Button
                size="small"
                shape="square"
                variant="tonal-card"
                className="h-12! w-fit justify-center gap-2 pl-3 pr-5 rounded-2xl border-none bg-card"
                style={shadowStyle}
              >
                <TelemostStackIcon className="-ml-1" />
                <CycleText
                  labels={[
                    tr("nav.order_cycle_1", "Оставить заявку"),
                    tr("nav.order_cycle_2", "Обсудить проект"),
                    tr("nav.order_cycle_3", "Аудит от CTO"),
                  ]}
                />
              </Button>
            </QuickOrderDialog>
          </div>
          
        </Container>
      </div>
    </header>
  );
}
