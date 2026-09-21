import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "./config";

// Static imports so the bundler knows about both dictionaries up-front.
// Dynamic `import(\`../messages/${locale}.json\`)` also works but is fragile
// under `output: "standalone"` — explicit map is safer.
const messageLoaders: Record<Locale, () => Promise<Record<string, unknown>>> = {
  ru: () => import("../messages/ru.json").then((m) => m.default),
  en: () => import("../messages/en.json").then((m) => m.default),
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
