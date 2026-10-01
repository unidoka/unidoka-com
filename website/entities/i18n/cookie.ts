import type { Language } from './translations';
export const cookieTranslations: Record<Language, Record<string, string>> = {
  en: {
    'cookie.title': 'About cookies',
    'cookie.body': "We use technical cookies without which the site doesn't work, plus analytics cookies to understand which pages are useful. Read more —",
    'cookie.policy_link': 'in our Cookie Policy',
    'cookie.accept_all': 'Accept all',
    'cookie.necessary_only': 'Only necessary',
  },
  ru: {
    'cookie.title': 'Про cookie-файлы',
    'cookie.body': 'Мы используем технические cookie, без которых сайт не работает, а также аналитические — чтобы понимать, какие страницы полезны. Подробнее —',
    'cookie.policy_link': 'в Политике cookie',
    'cookie.accept_all': 'Принять все',
    'cookie.necessary_only': 'Только необходимые',
  },
};
