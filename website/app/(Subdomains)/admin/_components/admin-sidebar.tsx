"use client";
import { VershinyLogo } from "@/components/icons/logotypes/vershiny-logo";
import { Sidebar, type SidebarItem } from "@/components/layout/nav/sidebar";
import { useAdminSecret } from "@/hooks/use-admin-secret";
import { useLanguage } from "@/providers/language-provider";
import { crossSubdomainUrl } from "@/utils/root-domain";
import {
  ChartLineUp,
  Users,
  Receipt,
  Buildings,
  Handshake,
  Cube,
  Newspaper,
  UsersThree,
  CalendarBlank,
  Ticket,
  FolderSimple,
  Megaphone,
  Wrench,
  SquaresFour,
} from "@phosphor-icons/react";

export function AdminSidebar() {
  const { secret, loading } = useAdminSecret();
  const { t } = useLanguage();

  if (loading || !secret) return null;

  const base = `/${secret}`;

  const items: SidebarItem[] = [
    {
      label: t("admin.dashboard"),
      href: "/",
      icon: ChartLineUp,
      exact: true,
    },
    {
      label: t("admin.users"),
      href: "/users",
      icon: Users,
      children: [{ label: t("admin.team"), href: "/team" }],
    },
    {
      label: t("admin.orders"),
      href: "/orders",
      icon: Receipt,
      children: [
        { label: t("admin.companies"), href: "/companies" },
        { label: t("admin.clients"), href: "/clients" },
      ],
    },
    {
      label: t("admin.solutions"),
      href: "/solutions",
      icon: Cube,
    },
    {
      label: t("admin.articles"),
      href: "/articles",
      icon: Newspaper,
    },
    {
      label: t("admin.events"),
      href: "/events",
      icon: CalendarBlank,
      children: [
        { label: t("admin.event_requests"), href: "/event-requests" },
      ],
    },
    {
      label: t("admin.catalog"),
      href: "/catalog",
      icon: FolderSimple,
    },
    {
      label: t("admin.vershiny"),
      href: "/vershiny",
      icon: VershinyLogo,
    },
    {
      label: t("admin.marketing"),
      href: "/marketing",
      icon: Megaphone,
      children: [
        { label: t("admin.marketing_placements"), href: "/marketing/placements" },
        { label: t("admin.marketing_tools"), href: "/marketing/tools" },
      ],
    },
  ];

  // `exact` on the Marketing parent prevents the group heading from
  // staying lit on /marketing/tools — without it, `startsWith("/marketing")`
  // would highlight the placement hub while the tools page is open.
  const parentOverrides: Record<string, boolean> = {
    "/marketing": true,
  };

  const enriched: SidebarItem[] = items.map((item) => ({
    ...item,
    href: crossSubdomainUrl(
      "admin",
      `${base}${item.href === "/" ? "" : item.href}`,
    ),
    exact: parentOverrides[item.href] ?? item.exact,
    children: item.children?.map((c) => ({
      ...c,
      href: crossSubdomainUrl("admin", `${base}${c.href}`),
    })),
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
