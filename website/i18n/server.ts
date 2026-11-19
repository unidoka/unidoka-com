import { headers } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "./config";

/**
 * Locale for the current request. `proxy.ts` sets `x-locale` when it
 * rewrites `/en/*`; everything else is the Russian default.
 */
export async function getLocale(): Promise<Locale> {
  const store = await headers();
  const value = store.get("x-locale");
  return isLocale(value) ? value : defaultLocale;
}

/** Prefix an absolute-path route for a locale (`/en/events`, `/events`). */
export function localePath(path: string, locale: Locale): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** Prefix an absolute URL for a locale. */
export function localeUrl(url: string, locale: Locale): string {
  if (locale === defaultLocale) return url;
  const parsed = new URL(url);
  parsed.pathname = localePath(parsed.pathname, locale);
  return parsed.toString();
}
