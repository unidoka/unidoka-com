"use client";
import { useRouter } from "next/navigation";
import { Sidebar, type SidebarItem } from "@/components/layout/nav/sidebar";
import { useUser } from "@/entities/user/model/user-context";
import { useLanguage } from "@/providers/language-provider";
import { Button } from "@/components/ui/button";
import {
  SignOutIcon, UserIcon, GearIcon, BriefcaseIcon, NewspaperIcon,
  CalendarBlankIcon,
} from "@phosphor-icons/react";

export function ProfileSidebar() {
  const router = useRouter();
  const { logout } = useUser();
  const { t } = useLanguage();

  const NAV_ITEMS: SidebarItem[] = [
    { label: t("nav.profile"), href: "/profile", icon: UserIcon, exact: true },
    { label: t("editor.my_articles"), href: "/profile/articles", icon: NewspaperIcon },
    { label: "Мои события", href: "/profile/events", icon: CalendarBlankIcon },
    { label: "Настройки", href: "/profile/settings", icon: GearIcon, exact: true },
    { label: "Безопасность", href: "/profile/security", icon: BriefcaseIcon, exact: true },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <Sidebar
      items={NAV_ITEMS}
      basePath="/app"
      title="Личный кабинет"
      storageKey="profile-sidebar-collapsed"
      className="mb-6"
      footer={
        <Button variant="text" onClick={handleLogout} className="w-full justify-start gap-3 p-3">
          <SignOutIcon className="size-5 shrink-0" />
          <span className="text-sm">Выйти</span>
        </Button>
      }
    />
  );
}
