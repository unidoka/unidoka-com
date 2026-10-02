import type { Language } from './translations';

export const heroTranslations: Record<Language, Record<string, string>> = {
  en: {
    'hero.order': 'Make an Order',
    'hero.title.part1': 'The most',
    'hero.title.part2': 'sharp:',
    'hero.subtitle':
      'Unidoka builds solutions that solve real problems — open-source frameworks, event calendars, and helpful tools for the IT community. From Amorfa (our full-stack AI framework) to Vershiny and the events calendar that help thousands prepare for what comes next.',
  },
  ru: {
    'hero.order': 'Оформить заказ',
    'hero.title.part1': 'Самые',
    'hero.title.part2': 'ровные:',
    'hero.subtitle':
      'Юнидока делает решения, которые решают сразу несколько задач — open-source фреймворки, календари событий и полезные инструменты для IT-сообщества. От Amorfa (нашего full-stack AI-фреймворка) до Вершин и календаря событий, которые помогают готовиться к главному.',
  },
};
