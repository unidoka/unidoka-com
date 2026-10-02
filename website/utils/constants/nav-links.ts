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

/**
 * Events are no longer a subdomain — the calendar lives at /events on the
 * root host. Only `0leak` remains a real subdomain, so the switch has just
 * two branches: "0leak" and "site" (the default/root).
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
        { label: "Вершины", target: { sub: "", path: "/events/vershiny" } },
        { label: "Календарь событий", target: { sub: "", path: "/events" } },
        { label: "Amorfa", target: { sub: "", path: "/amorfa" } },
        { label: "0leak", target: { sub: "0leak", path: "/" } },
      ];
  }
}

export function resolveHref(item: NavLinkItem, urlFor: UrlFor): string | null {
  if (item.dialog) return null;
  if (item.target) return urlFor(item.target.sub, item.target.path);
  return item.path ?? "/";
}
