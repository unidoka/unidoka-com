import type { Language } from './translations';

export const amorfaTranslations: Record<Language, Record<string, string>> = {
  en: {
    // ── Hero ────────────────────────────────────────────────────────────────
    'amorfa.hero_title_1': 'AI coding',
    'amorfa.hero_title_2': 'with less tech duty',
    'amorfa.title_1': 'Amorfa.',
    'amorfa.title_2': 'Fullstack in hours, not weeks.',
    'amorfa.description':
      'AI-optimized fullstack framework: FastAPI, Next.js, PostgreSQL, and Valkey - pre-wired, documented, and self-hostable.',
    'amorfa.cta_github': 'GitHub',
    'amorfa.cta_quickstart': 'Quick start',
    'amorfa.hero_replay': 'Replay animation',

    // ── Features ────────────────────────────────────────────────────────────
    'amorfa.features_title': 'Everything for production. Nothing extra.',
    'amorfa.feature_1_title': 'Ship in hours',
    'amorfa.feature_1_body': 'Clone, edit .env, run.',
    'amorfa.feature_2_title': 'AI-first structure',
    'amorfa.feature_2_body': 'LLM-readable context in every file.',
    'amorfa.feature_3_title': 'Fullstack, honestly',
    'amorfa.feature_3_body': 'FastAPI + Next.js. One repo.',
    'amorfa.feature_4_title': 'Zero lock-in',
    'amorfa.feature_4_body': 'Self-hosted on a single VPS.',
    'amorfa.feature_5_title': 'Multi-service ready',
    'amorfa.feature_5_body': 'Split into microservices when you need to.',
    'amorfa.feature_6_title': 'Documented defaults',
    'amorfa.feature_6_body': 'Auth, OTP and email flows pre-wired.',
    'amorfa.feature_7_title': 'Typed end to end',
    'amorfa.feature_7_body': 'TypeScript and Pydantic across the stack.',
    'amorfa.feature_8_title': 'One-command deploys',
    'amorfa.feature_8_body': 'Docker Compose + Traefik with TLS.',

    // ── Structure ───────────────────────────────────────────────────────────
    'amorfa.structure_title': 'One repo - two services.',
    'amorfa.structure_body_1':
      'Monorepo by default: backend and frontend side by side, but isolated. Splitting into microservices is one docker-compose away, not a rewrite.',
    'amorfa.structure_body_2':
      'Every file carries LLM-agent context: comments, structure, .agents/skills. A Repomix config packs the whole project into a single readable document - feed it to the model whole.',

    // ── Stack ───────────────────────────────────────────────────────────────
    'amorfa.stack_title': 'Modern, boring, reliable.',

    // ── Quickstart ──────────────────────────────────────────────────────────
    'amorfa.quickstart_title': 'Three commands to a working app.',
    'amorfa.step_1_title': 'Clone and configure',
    'amorfa.step_2_title': 'Bring up containers',
    'amorfa.step_3_title': 'Run migrations',
    'amorfa.quickstart_cta': 'All instructions on GitHub',

    // ── CTA ─────────────────────────────────────────────────────────────────
    'amorfa.cta_title_1': 'Open source.',
    'amorfa.cta_title_2': 'Your move.',
    'amorfa.cta_body': 'Fork it, extend it, send a PR.',
    'amorfa.cta_home': '← Back home',
  },
  ru: {
    // ── Hero ────────────────────────────────────────────────────────────────
    'amorfa.hero_title_1': 'ИИ-кодинг',
    'amorfa.hero_title_2': 'без технической рутины',
    'amorfa.title_1': 'Amorfa.',
    'amorfa.title_2': 'Fullstack за часы, а не недели.',
    'amorfa.description':
      'AI-оптимизированный fullstack-фреймворк: FastAPI, Next.js, PostgreSQL и Valkey - всё подключено, задокументировано и самохостится.',
    'amorfa.cta_github': 'GitHub',
    'amorfa.cta_quickstart': 'Быстрый старт',
    'amorfa.hero_replay': 'Смотреть анимацию',

    // ── Features ────────────────────────────────────────────────────────────
    'amorfa.features_title': 'Всё для продакшена. Ничего лишнего.',
    'amorfa.feature_1_title': 'Запуск за часы',
    'amorfa.feature_1_body': 'Клонируй, правь .env, запускай.',
    'amorfa.feature_2_title': 'AI-first структура',
    'amorfa.feature_2_body': 'LLM-контекст в каждом файле.',
    'amorfa.feature_3_title': 'Fullstack, честно',
    'amorfa.feature_3_body': 'FastAPI + Next.js. Один репозиторий.',
    'amorfa.feature_4_title': 'Ноль lock-in',
    'amorfa.feature_4_body': 'Самохостинг на одном VPS.',
    'amorfa.feature_5_title': 'Готов к микросервисам',
    'amorfa.feature_5_body': 'Разделяйте, когда это реально нужно.',
    'amorfa.feature_6_title': 'Задокументированные дефолты',
    'amorfa.feature_6_body': 'Авторизация, OTP и email уже подключены.',
    'amorfa.feature_7_title': 'Типы end to end',
    'amorfa.feature_7_body': 'TypeScript и Pydantic по всему стеку.',
    'amorfa.feature_8_title': 'Деплой одной командой',
    'amorfa.feature_8_body': 'Docker Compose + Traefik с TLS.',

    // ── Structure ───────────────────────────────────────────────────────────
    'amorfa.structure_title': 'Один репозиторий - два сервиса.',
    'amorfa.structure_body_1':
      'Монорепо по умолчанию: бэкенд и фронтенд рядом, но изолированы. Разделение на микросервисы - вопрос одного docker-compose, а не переписывания.',
    'amorfa.structure_body_2':
      'Каждый файл несёт контекст для LLM-агента: комментарии, структура, .agents/skills. Repomix-конфиг собирает весь проект в один читаемый документ - можно скармливать модели целиком.',

    // ── Stack ───────────────────────────────────────────────────────────────
    'amorfa.stack_title': 'Современный, простой, надёжный.',

    // ── Quickstart ──────────────────────────────────────────────────────────
    'amorfa.quickstart_title': 'Три команды до работающего приложения.',
    'amorfa.step_1_title': 'Клонировать и настроить',
    'amorfa.step_2_title': 'Поднять контейнеры',
    'amorfa.step_3_title': 'Применить миграции',
    'amorfa.quickstart_cta': 'Все инструкции на GitHub',

    // ── CTA ─────────────────────────────────────────────────────────────────
    'amorfa.cta_title_1': 'Открытый код.',
    'amorfa.cta_title_2': 'Ваш ход.',
    'amorfa.cta_body': 'Форкайте, дописывайте, присылайте PR.',
    'amorfa.cta_home': '← На главную',
  },
};
