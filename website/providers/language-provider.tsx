"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { Language, translations } from "@/entities/i18n/translations";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("ru");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // 1. Check URL search param first (?lang=en or ?lang=ru)
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get("lang");
    
    if (urlLang === "en" || urlLang === "ru") {
      setLangState(urlLang);
      localStorage.setItem("lang", urlLang);
      return;
    }

    // 2. Check localStorage
    const stored = localStorage.getItem("lang") as Language | null;
    if (stored === "en" || stored === "ru") {
      setLangState(stored);
      return;
    }

    // 3. Check OS language as final fallback
    if (typeof navigator !== "undefined") {
      const osLang = navigator.language.toLowerCase();
      if (osLang.startsWith("ru")) {
        setLangState("ru");
      } else {
        setLangState("en");
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      document.documentElement.lang = lang;
    }
  }, [lang, isMounted]);

  const setLang = useCallback((newLang: Language) => {
    localStorage.setItem("lang", newLang);
    setLangState(newLang);
    
    // Update search param without triggering a full page reload
    const params = new URLSearchParams(window.location.search);
    params.set("lang", newLang);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  }, []);

  const t = useCallback((key: string) => {
    return translations[lang]?.[key] || key;
  }, [lang]);

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
