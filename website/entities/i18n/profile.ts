import type { Language } from './translations';

export const profileTranslations: Record<Language, Record<string, string>> = {
  en: {
    'profile.eyebrow': 'Public profile',
    'profile.member_since': 'On Unidoka since',
    'profile.role': 'Role',
    'profile.verified': 'Verified',
    'profile.unverified': 'Unverified',
    'profile.link_github': 'GitHub',
    'profile.link_telegram': 'Telegram',
    'profile.no_bio': 'No bio yet.',
    'profile.section_about': 'About',
    'profile.section_events': 'Events',
    'profile.section_events_eyebrow': 'Public activity',
    'profile.events_count_one': 'event submitted',
    'profile.events_count_many': 'events submitted',
    'profile.no_events_title': 'No published events yet',
    'profile.no_events_body':
      'This user has not published any events to the calendar.',
    'profile.back': 'Back',
    'profile.not_found_title': 'User not found',
    'profile.not_found_body':
      'This profile does not exist, was renamed, or has been removed.',
    'profile.not_found_cta': 'Go home',
    'profile.stats_events': 'Events',
    'profile.stats_member': 'Member since',
  },
  ru: {
    'profile.eyebrow': 'Публичный профиль',
    'profile.member_since': 'На Unidoka с',
    'profile.role': 'Роль',
    'profile.verified': 'Подтверждён',
    'profile.unverified': 'Не подтверждён',
    'profile.link_github': 'GitHub',
    'profile.link_telegram': 'Telegram',
    'profile.no_bio': 'Био пока нет.',
    'profile.section_about': 'О пользователе',
    'profile.section_events': 'События',
    'profile.section_events_eyebrow': 'Публичная активность',
    'profile.events_count_one': 'событие в календаре',
    'profile.events_count_many': 'событий в календаре',
    'profile.no_events_title': 'Опубликованных событий пока нет',
    'profile.no_events_body':
      'Этот пользователь ещё не публиковал события в календаре.',
    'profile.back': 'Назад',
    'profile.not_found_title': 'Пользователь не найден',
    'profile.not_found_body':
      'Такого профиля не существует, он был переименован или удалён.',
    'profile.not_found_cta': 'На главную',
    'profile.stats_events': 'События',
    'profile.stats_member': 'С нами с',
  },
};
