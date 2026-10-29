"use client";
import { VershinyLogo } from "@/components/icons/logotypes/vershiny-logo";
import { Sidebar, type SidebarItem } from "@/components/layout/nav/sidebar";
import { useAdminSecret } from "@/hooks/use-admin-secret";
import { useLanguage } from "@/providers/language-provider";
import { useUser } from "@/entities/user/model/user-context";
import { crossSubdomainUrl } from "@/utils/root-domain";
import { hasPermission, type AdminPermission } from "@/utils/permissions";
import {
  ChartLineUp,
  Users,
  Receipt,
  Cube,
  Newspaper,
  CalendarBlank,
  FolderSimple,
  Megaphone,
  Key,
} from "@phosphor-icons/react";

interface AdminNavItem extends SidebarItem {
  permission: AdminPermission;
}

/**
 * Admin navigation, filtered by the current user's permission set.
 *
 * Every entry declares one permission. An `admin` sees only the
 * entries they hold; a `root` sees everything (hasPermission returns
 * true unconditionally for root). The filtering happens here rather
 * than inside the generic Sidebar — the Sidebar component doesn't
 * know about permissions and shouldn't.
 *
 * This is UX only. Each admin page also mounts `<CheckUser
 * permission="…">` and every backend endpoint independently verifies
 * — a user who types a hidden URL gets a "no access" block, and a
 * direct API call gets a 403.
 */
export function AdminSidebar() {
  const { secret, loading } = useAdminSecret();
  const { t } = useLanguage();
  const { user } = useUser();

  if (loading || !secret || !user) return null;

  const base = `/${secret}`;

  const allItems: AdminNavItem[] = [
    {
      label: t("admin.dashboard"),
      href: "/",
      icon: ChartLineUp,
      exact: true,
      permission: "admin.dashboard",
    },
    {
      label: t("admin.users"),
      href: "/users",
      icon: Users,
      permission: "admin.users",
      children: [{ label: t("admin.team"), href: "/team" }],
    },
    {
      label: t("admin.orders"),
      href: "/orders",
      icon: Receipt,
      permission: "admin.orders",
      children: [
        { label: t("admin.companies"), href: "/companies" },
        { label: t("admin.clients"), href: "/clients" },
      ],
    },
    {
      label: t("admin.solutions"),
      href: "/solutions",
      icon: Cube,
      permission: "admin.solutions",
    },
    {
      label: t("admin.articles"),
      href: "/articles",
      icon: Newspaper,
      permission: "admin.articles",
    },
    {
      label: t("admin.events"),
      href: "/events",
      icon: CalendarBlank,
      permission: "admin.events",
      children: [
        { label: t("admin.event_requests"), href: "/event-requests" },
      ],
    },
    {
      label: t("admin.catalog"),
      href: "/catalog",
      icon: FolderSimple,
      permission: "admin.catalog",
    },
    {
      label: t("admin.vershiny"),
      href: "/vershiny_top",
      icon: VershinyLogo,
      permission: "admin.vershiny",
    },
    {
      label: t("admin.marketing"),
      href: "/marketing",
      icon: Megaphone,
      permission: "admin.marketing",
      children: [
        { label: t("admin.marketing_placements"), href: "/marketing/placements" },
        { label: t("admin.marketing_tools"), href: "/marketing/tools" },
      ],
    },
    {
      label: "API-ключи",
      href: "/api-keys",
      icon: Key,
      permission: "admin.apikeys",
    },
  ];

  // Drop what the user can't reach. Empty sidebar is the correct
  // outcome for an admin with no grants — it's the UI honestly
  // reflecting the permission set, not a bug.
  const visible = allItems.filter((item) =>
    hasPermission(user, item.permission),
  );

  const parentOverrides: Record<string, boolean> = { "/marketing": true };

  const enriched: SidebarItem[] = visible.map((item) => ({
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
