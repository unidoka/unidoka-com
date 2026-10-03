import type { Language } from './translations';

export const heroTranslations: Record<Language, Record<string, string>> = {
  en: {
    'hero.order': 'Make an Order',
    'hero.title.part1': 'The most',
    'hero.title.part2': 'sharp:',
    'hero.subtitle':
      'Open-source frameworks, event calendars, and tools for the IT community.',
  },
  ru: {
    'hero.order': 'Оформить заказ',
    'hero.title.part1': 'Самые',
    'hero.title.part2': 'ровные:',
    'hero.subtitle':
      'Open-source фреймворки, календари событий и инструменты для IT-сообщества.',
  },
};
