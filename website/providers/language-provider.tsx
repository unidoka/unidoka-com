"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { Language, translations } from "@/entities/i18n/translations";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function localeFromPath(pathname: string | null): Language {
  if (!pathname) return "ru";
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "ru";
}

function stripLocale(pathname: string): string {
  if (pathname === "/en") return "/";
  return pathname.startsWith("/en/") ? pathname.slice(3) : pathname;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const pathLocale = useMemo(() => localeFromPath(pathname), [pathname]);
  const [lang, setLangState] = useState<Language>(pathLocale);

  // The URL is the single source of truth: /en/* is English, everything
  // else is Russian. This stays in sync on client-side navigation.
  useEffect(() => {
    setLangState(pathLocale);
  }, [pathLocale]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback(
    (newLang: Language) => {
      setLangState(newLang);
      document.documentElement.lang = newLang;

      const current = window.location.pathname;
      const base = stripLocale(current);
      const target =
        newLang === "en"
          ? base === "/"
            ? "/en"
            : `/en${base}`
          : base;

      router.push(`${target}${window.location.search}${window.location.hash}`);
    },
    [router],
  );

  const t = useCallback(
    (key: string) => translations[lang]?.[key] || key,
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
