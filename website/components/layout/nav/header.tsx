"use client";
import { Container } from "@/components/ui/container";
import Link from "next/link";
import Logo from "@/components/layout/logo/logo";
import { Button } from "@/components/ui/button";
import { NavLink } from "./nav-link";
import { Lightbulb, User } from "@phosphor-icons/react";
import { ROUTES } from "@/utils/constants/routes";
import { useUser } from "@/entities/user/model/user-context";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminSecret } from "@/hooks/use-admin-secret";
import { useRootHref } from "@/hooks/use-root-href";
import { crossSubdomainUrl, rootDomainUrl } from "@/utils/root-domain";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { FloatingMenu } from "./floating-menu";
import { ConsultDialog } from "@/components/consult-dialog";
export default function Header() {
  const { user, isLoading, logout } = useUser();
  const { t } = useLanguage();
  const logoHref = useRootHref();
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const { secret: adminSecret } = useAdminSecret();
  const pathname = usePathname();
  const isFullWidth =
    pathname?.startsWith("/admin") || pathname?.startsWith("/app/profile");
  const adminHref = adminSecret
    ? crossSubdomainUrl("admin", `/${adminSecret}`)
    : null;
  const profileHref = crossSubdomainUrl("app", "/profile");
  const rootLink = (path: string) => rootDomainUrl(path);
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 justify-center w-full flex items-center mx-auto transition-width duration-400 ease-in-out",
        isScrolled ? "max-w-[1000px]" : "max-w-full",
      )}
    >
      <Container
        variant={isFullWidth ? "full-width" : "default"}
        className="flex justify-center gap-6 sm:justify-between
        bg-[var(--bg)]/40 backdrop-blur-glass border-b border-b-(--card-glass)
        rounded-full mx-4 sm:px-6 sm:mx-0 mt-2 h-[55px] sm:h-[80px] px-6
        "
      >
        <div
          className={cn(
            isLoading || user ? "sm:justify-between" : "justify-between",
            "w-full flex items-center gap-6",
          )}
        >
          <Link href={logoHref}>
            <Logo className="!h-[24px] sm:h-[40px]" />
          </Link>
          <nav className="hidden lg:flex gap-4 text-sm">
            <NavLink href={rootLink(ROUTES.projects.href)}>{t("nav.projects")}</NavLink>
            <NavLink href={rootLink(ROUTES.services.href)}>{t("nav.services")}</NavLink>
            <NavLink href={rootLink(ROUTES.events.href)}>{t("nav.events")}</NavLink>
            <NavLink href={rootLink(ROUTES.companies.href)}>{t("nav.companies")}</NavLink>
            <NavLink href={rootLink(ROUTES.about.href)}>{t("nav.about")}</NavLink>
            <NavLink href={rootLink(ROUTES.blog.href)}>{t("nav.blog")}</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-1.5">
          <ConsultDialog>
            <Button size={"small"} className="hidden md:inline-flex">
              <Lightbulb />
              {t("nav.request")}
            </Button>
          </ConsultDialog>
          <LanguageSwitcher />
          {isLoading ? (
            <div className="ml-1 flex items-center">
              <Skeleton className="size-8 rounded-full" />
            </div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="text" size="icon-small" className="ml-1">
                  <User className="stroke-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={profileHref} prefetch={false}>{t("nav.profile")}</Link>
                </DropdownMenuItem>
                {(user?.role === "admin" || user?.role === "root") && adminHref && (
                  <DropdownMenuItem asChild>
                    <Link href={adminHref}>{t("nav.admin")}</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={logout}>{t("nav.logout")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-1 ml-1">
              <Button size="small" variant="text" asChild>
                <Link href={rootLink("/login")}>{t("nav.login")}</Link>
              </Button>
              <Button size="small" asChild>
                <Link href={rootLink("/register")}>{t("nav.register")}</Link>
              </Button>
            </div>
          )}
          <FloatingMenu
            position="top"
            triggerClassName="hidden sm:flex lg:hidden"
          />
        </div>
      </Container>
    </header>
  );
}
