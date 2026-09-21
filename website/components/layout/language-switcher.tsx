"use client";
import { useTransition } from "react";
import { setLocale as setLocaleServerAction } from "@/app/actions/locale";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  // Local provider drives the immediate UI state (no reload needed).
  const { locale: current, setLocale } = useLanguage();
  const [pending, startTransition] = useTransition();

  const change = (next: Locale) => {
    if (next === current) return;
    // 1) Update the client-side context right away.
    setLocale(next);
    // 2) Persist the cookie server-side so RSC/next-intl stay in sync.
    startTransition(() => setLocaleServerAction(next));
  };

  return (
    <div
      role="group"
      aria-label="Language"
      className="flex items-center gap-0.5 rounded-full border border-(--outline) bg-(--card) p-0.5 w-fit h-9"
    >
      {locales.map((l) => {
        const isActive = l === current;
        return (
          <button
            key={l}
            type="button"
            disabled={pending}
            aria-pressed={isActive}
            aria-label={localeNames[l]}
            onClick={() => change(l)}
            className={cn(
              "flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 outline-none cursor-pointer disabled:opacity-50",
              isActive
                ? "bg-(--on-bg-high) text-(--bg) shadow-sm"
                : "text-(--on-bg-low) hover:bg-(--state-hover) hover:text-(--on-bg-high)"
            )}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
