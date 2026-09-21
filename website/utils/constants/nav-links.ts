import type { Subdomain } from "@/hooks/use-host";

export type NavDialogKind = "request-demo" | "add-event";

export interface NavLinkItem {
  label: string;
  /** Same-host relative path. Mutually exclusive with `target`. */
  path?: string;
  /** Cross-subdomain target. "" means the root host. */
  target?: { sub: Subdomain | ""; path: string };
  /** Opens a dialog instead of navigating. */
  dialog?: NavDialogKind;
}

export type UrlFor = (sub: Subdomain | "", path: string) => string;

export function buildNavLinks(subdomain: Subdomain): NavLinkItem[] {
  switch (subdomain) {
    case "events":
      return [
        { label: "Unidoka", target: { sub: "", path: "/" } },
        { label: "Вершины", path: "/vershiny" },
        { label: "Календарь событий", path: "/" },
        { label: "Добавить событие", dialog: "add-event" },
      ];
    case "0leak":
      return [
        { label: "Unidoka", target: { sub: "", path: "/" } },
        { label: "Как это работает", path: "/#how" },
        { label: "Почему мы", path: "/#why" },
        { label: "Запросить демо", dialog: "request-demo" },
        { label: "Датчики", path: "/#detectors" },
      ];
    default:
      return [
        { label: "Вершины", target: { sub: "events", path: "/vershiny" } },
        { label: "Календарь событий", target: { sub: "events", path: "/" } },
        { label: "0leak", target: { sub: "0leak", path: "/" } },
      ];
  }
}

export function resolveHref(item: NavLinkItem, urlFor: UrlFor): string | null {
  if (item.dialog) return null;
  if (item.target) return urlFor(item.target.sub, item.target.path);
  return item.path ?? "/";
}
