"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import ruMessages from "@/messages/ru.json";
import enMessages from "@/messages/en.json";

type Locale = "ru" | "en";

// Static imports so the bundler sees both dictionaries up-front.
const dictionaries: Record<Locale, Record<string, unknown>> = {
  ru: ruMessages as Record<string, unknown>,
  en: enMessages as Record<string, unknown>,
};

const COOKIE_NAME = "NEXT_LOCALE";
const ONE_YEAR = 60 * 60 * 24 * 365;

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

// Resolve "nav.projects" against a nested dictionary. Returns the key
// itself if missing, so a typo is visible rather than silently empty.
function getByPath(source: Record<string, unknown>, path: string): string {
  const parts = path.split(".");
  let cursor: unknown = source;
  for (const part of parts) {
    if (cursor == null || typeof cursor !== "object") return path;
    cursor = (cursor as Record<string, unknown>)[part];
  }
  return typeof cursor === "string" ? cursor : path;
}

function readCookieLocale(): Locale | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));
  const value = match?.split("=")[1];
  return value === "ru" || value === "en" ? value : null;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Server render always starts on the default locale; the client
  // syncs to the cookie inside useEffect so hydration stays stable.
  const [locale, setLocaleState] = useState<Locale>("ru");

  useEffect(() => {
    const cookieLocale = readCookieLocale();
    if (cookieLocale) setLocaleState(cookieLocale);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    if (typeof document !== "undefined") {
      document.cookie = `${COOKIE_NAME}=${next}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
    }
    setLocaleState(next);
  }, []);

  const t = useCallback(
    (key: string) => getByPath(dictionaries[locale], key),
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
