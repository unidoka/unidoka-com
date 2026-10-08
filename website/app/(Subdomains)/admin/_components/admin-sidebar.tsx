"use client";
import { VershinyLogo } from "@/components/icons/logotypes/vershiny-logo";
import { Sidebar, type SidebarItem } from "@/components/layout/nav/sidebar";
import { useAdminSecret } from "@/hooks/use-admin-secret";
import { useLanguage } from "@/providers/language-provider";
import { crossSubdomainUrl } from "@/utils/root-domain";
import {
  ChartLineUp, Users, Receipt, Buildings, Handshake,
  Cube, Newspaper, UsersThree, CalendarBlank, Ticket, FolderSimple,
} from "@phosphor-icons/react";

export function AdminSidebar() {
  const { secret, loading } = useAdminSecret();
  const { t } = useLanguage();
  if (loading || !secret) return null;

  const items: SidebarItem[] = [
    { label: t("admin.dashboard"), href: "/", icon: ChartLineUp, exact: true },
    { label: t("admin.users"), href: "/users", icon: Users },
    { label: t("admin.orders"), href: "/orders", icon: Receipt },
    { label: t("admin.companies"), href: "/companies", icon: Buildings },
    { label: t("admin.clients"), href: "/clients", icon: Handshake },
    { label: t("admin.projects"), href: "/projects", icon: Cube },
    { label: t("admin.articles"), href: "/articles", icon: Newspaper },
    { label: t("admin.team"), href: "/team", icon: UsersThree },
    { label: t("admin.events"), href: "/events", icon: CalendarBlank },
    { label: t("admin.event_types"), href: "/event-types", icon: FolderSimple },
    { label: t("admin.organizers"), href: "/organizers", icon: Buildings },
    { label: t("admin.directions"), href: "/directions", icon: VershinyLogo },
    { label: t("admin.event_requests"), href: "/event-requests", icon: Ticket },
    { label: t("admin.catalog"), href: "/catalog", icon: FolderSimple },
  ];

  const enriched: SidebarItem[] = items.map((item) => ({
    ...item,
    href: crossSubdomainUrl("admin", `/${secret}${item.href === "/" ? "" : item.href}`),
  }));

  return (
    <Sidebar
      items={enriched}
      basePath=""
      title={t("admin.sidebar_title")}
      storageKey="admin-sidebar-collapsed"
      className="mb-6"
    />
  );
}
