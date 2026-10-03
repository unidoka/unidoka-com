import type { Language } from './translations';

export const profileTranslations: Record<Language, Record<string, string>> = {
  en: {
    // Hero
    'profile.eyebrow': 'Public profile',
    'profile.back': 'Back',
    'profile.verified': 'Verified',
    'profile.unverified': 'Unverified',
    'profile.member_since': 'Member since',
    'profile.copy_handle': 'Copy handle',
    'profile.copied': 'Copied',

    // Links
    'profile.link_github': 'GitHub',
    'profile.link_telegram': 'Telegram',

    // Bio
    'profile.no_bio': 'No bio yet.',

    // Stats — two cards
    'profile.stats_events': 'Events',
    'profile.stats_member': 'Member since',
    'profile.stat_events_subtitle_zero': 'Nothing published yet',
    'profile.stat_events_subtitle_one': 'event on the calendar',
    'profile.stat_events_subtitle_many': 'events on the calendar',
    'profile.stat_events_breakdown': 'upcoming · past',
    'profile.stat_member_subtitle': 'days on Unidoka',
    'profile.stat_member_subtitle_new': 'joined recently',

    // Events section
    'profile.section_events': 'Events',
    'profile.section_events_eyebrow': 'Public activity',
    'profile.events_count_one': 'event',
    'profile.events_count_many': 'events',
    'profile.no_events_title': 'No published events yet',
    'profile.no_events_body':
      'This user has not published any events to the calendar.',

    // 404
    'profile.not_found_title': 'User not found',
    'profile.not_found_body':
      'This profile does not exist, was renamed, or has been removed.',
    'profile.not_found_cta': 'Go home',
  },

  ru: {
    // Hero
    'profile.eyebrow': 'Публичный профиль',
    'profile.back': 'Назад',
    'profile.verified': 'Подтверждён',
    'profile.unverified': 'Не подтверждён',
    'profile.member_since': 'С нами с',
    'profile.copy_handle': 'Скопировать ник',
    'profile.copied': 'Скопировано',

    // Links
    'profile.link_github': 'GitHub',
    'profile.link_telegram': 'Telegram',

    // Bio
    'profile.no_bio': 'Био пока нет.',

    // Stats — two cards
    'profile.stats_events': 'События',
    'profile.stats_member': 'С нами с',
    'profile.stat_events_subtitle_zero': 'Пока ничего не опубликовано',
    'profile.stat_events_subtitle_one': 'событие в календаре',
    'profile.stat_events_subtitle_many': 'событий в календаре',
    'profile.stat_events_breakdown': 'впереди · прошло',
    'profile.stat_member_subtitle': 'дней на Unidoka',
    'profile.stat_member_subtitle_new': 'недавно присоединился',

    // Events section
    'profile.section_events': 'События',
    'profile.section_events_eyebrow': 'Публичная активность',
    'profile.events_count_one': 'событие',
    'profile.events_count_many': 'событий',
    'profile.no_events_title': 'Опубликованных событий пока нет',
    'profile.no_events_body':
      'Этот пользователь ещё не публиковал события в календаре.',

    // 404
    'profile.not_found_title': 'Пользователь не найден',
    'profile.not_found_body':
      'Такого профиля не существует, он был переименован или удалён.',
    'profile.not_found_cta': 'На главную',
  },
};
