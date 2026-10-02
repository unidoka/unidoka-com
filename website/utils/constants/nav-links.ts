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
 * Only `0leak` remains a real subdomain. Events, Vershiny, and Amorfa
 * live as plain routes on the root host.
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
        { label: "Решения", path: "/services" },
        { label: "Unidoka API", path: "/docs" },
        { label: "Команда", path: "/about" },
        { label: "Amorfa", path: "/amorfa" },
        { label: "События", path: "/events" },
        { label: "Вершины", path: "/vershiny" },
      ];
  }
}

export function resolveHref(item: NavLinkItem, urlFor: UrlFor): string | null {
  if (item.dialog) return null;
  if (item.target) return urlFor(item.target.sub, item.target.path);
  return item.path ?? "/";
}
