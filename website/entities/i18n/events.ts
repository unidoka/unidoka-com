import type { Language } from './translations';
export const eventsTranslations: Record<Language, Record<string, string>> = {
  en: {
    'events.title': 'Events',
    'events.upcoming': 'Upcoming',
    'events.past': 'Past',
    'events.past_badge': 'Past',
    'events.featured_badge': 'Featured',
    'events.date_tbd': 'Date TBD',
    'events.empty_title': 'No events yet',
    'events.empty_body': "Events will appear here as soon as they're published.",
    'events.back_home': 'Back home',
  },
  ru: {
    'events.title': 'События',
    'events.upcoming': 'Скоро',
    'events.past': 'Прошли',
    'events.past_badge': 'Прошло',
    'events.featured_badge': 'Featured',
    'events.date_tbd': 'Дата уточняется',
    'events.empty_title': 'Пока нет событий',
    'events.empty_body': 'События появятся здесь, как только будут опубликованы.',
    'events.back_home': 'На главную',
  },
};
