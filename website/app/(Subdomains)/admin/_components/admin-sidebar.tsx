"use client";
import { Sidebar, SidebarItem } from "@/components/layout/nav/sidebar";
import { useAdminSecret } from "@/hooks/use-admin-secret";
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

const navItems: SidebarItem[] = [
  { label: "Дашборд", href: "", icon: ChartDonut },
  { label: "Пользователи", href: "/users", icon: Users },
  { label: "Заявки", href: "/orders", icon: CaretDown },
  { label: "Компании", href: "/companies", icon: Building },
  { label: "Клиенты", href: "/clients", icon: Handshake },
  { label: "Проекты", href: "/projects", icon: Cube },
  { label: "Статьи", href: "/articles", icon: Newspaper },
  { label: "Команда", href: "/team", icon: Meteor },
];

export function AdminSidebar({ secret }: { secret: string }) {
  const { secret: adminSecret, loading: adminSecretLoading } = useAdminSecret();
  return (
    <Sidebar
      items={navItems}
      basePath={`/admin/${adminSecret}`}
      title="Админ-панель"
      className="mb-6"
    />
  );
}
