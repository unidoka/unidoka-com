import type { Subdomain } from "@/hooks/use-host";

export type NavDialogKind = "request-demo" | "add-event";

export interface NavLinkItem {
  label: string;
  path?: string;
  target?: { sub: Subdomain | ""; path: string };
  dialog?: NavDialogKind;
}

export type UrlFor = (sub: Subdomain | "", path: string) => string;

/**
 * Events are no longer a subdomain — /events lives on the root host.
 * Subdomain is now just "site" | "0leak", so the switch has two branches.
 */
export function buildNavLinks(subdomain: Subdomain): NavLinkItem[] {
  switch (subdomain) {
    case "0leak":
      return [
        { label: "Юнидока", target: { sub: "", path: "/" } },
        { label: "Как это работает", path: "/#how" },
        { label: "Почему мы", path: "/#why" },
        { label: "Запросить демо", dialog: "request-demo" },
        { label: "Датчики", path: "/#detectors" },
      ];
    default:
      return [
        { label: "Вершины", path: "/events/vershiny" },
        { label: "Календарь событий", path: "/events" },
        { label: "Amorfa", path: "/amorfa" },
        { label: "Документы", path: "/docs" },
      ];
  }
}

export function resolveHref(item: NavLinkItem, urlFor: UrlFor): string | null {
  if (item.dialog) return null;
  if (item.target) return urlFor(item.target.sub, item.target.path);
  return item.path ?? "/";
}
