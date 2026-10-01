"use client";
import { Sidebar, type SidebarItem } from "@/components/layout/nav/sidebar";
import { useAdminSecret } from "@/hooks/use-admin-secret";
import { crossSubdomainUrl } from "@/utils/root-domain";
import {
  Handshake,
  Newspaper,
  Cube,
  Building,
  CaretDown,
  Users,
  Meteor,
  ChartDonut,
} from "@phosphor-icons/react";
const BASE_ITEMS: SidebarItem[] = [
  { label: "Дашборд", href: "", icon: ChartDonut },
  { label: "Пользователи", href: "/users", icon: Users },
  { label: "Заявки", href: "/orders", icon: CaretDown },
  { label: "Компании", href: "/companies", icon: Building },
  { label: "Клиенты", href: "/clients", icon: Handshake },
  { label: "Проекты", href: "/projects", icon: Cube },
  { label: "Статьи", href: "/articles", icon: Newspaper },
  { label: "Команда", href: "/team", icon: Meteor },
];
export function AdminSidebar() {
  const { secret, loading } = useAdminSecret();
  if (loading) return null;
  if (!secret) return null;
  // crossSubdomainUrl returns:
  //   prod: https://admin.unidoka.com/<secret>/<href>
  //   dev:  /admin/<secret>/<href>
  // In prod the basePath is a full URL, so we bake it into each href and
  // pass an empty basePath to <Sidebar>.
  const items: SidebarItem[] = BASE_ITEMS.map((item) => ({
    ...item,
    href: crossSubdomainUrl(
      "admin",
      `/${secret}${item.href === "" ? "" : item.href}`,
    ),
  }));
  return (
    <Sidebar
      items={items}
      basePath=""
      title="Админ-панель"
      storageKey="admin-sidebar-collapsed"
      className="mb-6"
    />
  );
}
