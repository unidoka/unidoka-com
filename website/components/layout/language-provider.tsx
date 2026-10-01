"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { translations, type Language } from "@/lib/translations";

const COOKIE_NAME = "NEXT_LOCALE";
const ONE_YEAR = 60 * 60 * 24 * 365;

interface LanguageContextValue {
  locale: Language;
  t: (key: string) => string;
  setLocale: (locale: Language) => void;
}

export const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function readCookieLocale(): Language | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  const value = match ? decodeURIComponent(match[1]) : null;
  return value === "ru" || value === "en" ? value : null;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Language>("ru");

  useEffect(() => {
    const cookieLocale = readCookieLocale();
    if (cookieLocale) setLocaleState(cookieLocale);
  }, []);

  const setLocale = useCallback((next: Language) => {
    if (typeof document !== "undefined") {
      document.cookie = `${COOKIE_NAME}=${next}; path=/; max-age=${ONE_YEAR}; SameSite=Lax${
        window.location.hostname !== "localhost" ? "; domain=." + window.location.hostname : ""
      }`;
    }
    setLocaleState(next);
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[locale][key] ?? key;
    },
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, t, setLocale }}>
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
