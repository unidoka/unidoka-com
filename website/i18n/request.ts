import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "./config";

// Static imports so the bundler knows about both dictionaries up-front.
// Dynamic `import(\`../messages/${locale}.json\`)` also works but is fragile
// under `output: "standalone"` - explicit map is safer.
// next-intl is scaffolded here but the running app uses a custom
// LanguageProvider (providers/language-provider.tsx) backed by
// lib/translations.ts. The JSON dictionaries were never committed.
// Empty objects keep the build green without a dead import path.
// If you ever migrate to next-intl, drop ru.json / en.json into
// ./messages/ and restore the dynamic imports.
const messageLoaders: Record<Locale, () => Promise<Record<string, unknown>>> = {
  ru: async () => ({}),
  en: async () => ({}),
};

export default getRequestConfig(async () => {
  const store = await cookies();
  const cookieLocale = store.get("NEXT_LOCALE")?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;

  return {
    locale,
    messages: await messageLoaders[locale](),
  };
});
