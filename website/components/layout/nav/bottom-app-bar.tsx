"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, FolderSimple, Info, Article } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/utils/constants/routes";
import { useLanguage } from "@/providers/language-provider";

export default function BottomAppBar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const items = [
    { href: ROUTES.home.href, label: t("nav.home"), icon: House },
    { href: ROUTES.projects.href, label: t("nav.projects"), icon: FolderSimple },
    { href: ROUTES.about.href, label: t("nav.about"), icon: Info },
    { href: ROUTES.blog.href, label: t("nav.blog"), icon: Article },
  ];

  return (
    <nav
      aria-label="Bottom app bar"
      className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden border-t border-(--outline) bg-(--bg)/90 backdrop-blur-glass"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname?.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-body-5 transition-colors",
              isActive
                ? "text-(--primary)"
                : "text-(--on-bg-medium) hover:text-(--on-bg-high)"
            )}
          >
            <Icon className="size-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
