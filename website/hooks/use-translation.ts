"use client";

import { useLanguage } from "@/providers/language-provider";
import type { Language } from "@/entities/i18n/translations";

interface TranslationContextValue {
  locale: Language;
  t: (key: string) => string;
  setLocale: (locale: Language) => void;
}

export function useTranslation(): TranslationContextValue {
  const { lang, t, setLang } = useLanguage();
  return {
    locale: lang,
    t,
    setLocale: setLang,
  };
}
