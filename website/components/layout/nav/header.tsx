"use client";
import { Container } from "@/components/ui/container";
import Link from "next/link";
import Logo from "@/components/layout/logo/logo";
import { Button } from "@/components/ui/button";
import { Lightbulb, User } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminSecret } from "@/hooks/use-admin-secret";
import { useHost } from "@/hooks/use-host";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { FloatingMenu } from "./floating-menu";
import { NavItem } from "./nav-item";
import { useUser } from "@/entities/user/model/user-context";
import { buildNavLinks } from "@/utils/constants/nav-links";

export default function Header() {
  const { user, isLoading, logout } = useUser();
  const { t } = useLanguage();
  const { subdomain } = useHost();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { secret: adminSecret } = useAdminSecret();
  const isFullWidth =
    pathname?.startsWith("/admin") || pathname?.startsWith("/app/profile");

  const links = buildNavLinks(subdomain);
  const bare = (pathname ?? "").split("#")[0];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 justify-center w-full flex items-center mx-auto transition-width duration-400 ease-in-out",
        isScrolled ? "max-w-[900px]" : "max-w-full"
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
            "w-full flex items-center gap-6"
          )}
        >
          <Link href="/">
            <Logo className="!h-[24px] sm:h-[40px]" />
          </Link>

          <nav className="hidden md:flex items-center gap-4 text-sm">
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
                  variant="header"
                  active={isActive}
                />
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          {subdomain === "site" && (
            <Button size={"small"} className="hidden md:flex" asChild>
              <Link href="/order">
                <Lightbulb />
                {t("nav.order")}
              </Link>
            </Button>
          )}

          <LanguageSwitcher />

          {isLoading ? (
            <div className="ml-2 flex items-center">
              <Skeleton className="size-8 rounded-full" />
            </div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="text" size="icon-small" className="ml-2">
                  <User className="stroke-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/app/profile">{t("nav.profile")}</Link>
                </DropdownMenuItem>
                {(user?.role === "admin" || user?.role === "root") &&
                  adminSecret && (
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/${adminSecret}`}>{t("nav.admin")}</Link>
                    </DropdownMenuItem>
                  )}
                <DropdownMenuItem onClick={logout}>{t("nav.logout")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          <FloatingMenu />
        </div>
      </Container>
    </header>
  );
}
