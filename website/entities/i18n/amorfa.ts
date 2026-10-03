import type { Language } from './translations';

export const amorfaTranslations: Record<Language, Record<string, string>> = {
  en: {
    // ── Hero ────────────────────────────────────────────────────────
    'amorfa.eyebrow': 'Open source · Unidoka',
    'amorfa.title_1': 'Amorfa.',
    'amorfa.title_2': 'Fullstack in hours, not weeks.',
    'amorfa.description':
      'AI-optimized fullstack framework: FastAPI, Next.js, PostgreSQL, and Valkey — pre-wired, documented, and self-hostable. Clone the repo and start building the thing you actually wanted to build.',
    'amorfa.cta_github': 'Open on GitHub',
    'amorfa.cta_quickstart': 'Quick start',

    // ── Features ────────────────────────────────────────────────────
    'amorfa.features_eyebrow': "What's inside",
    'amorfa.features_title':
      'Everything you need for production — and nothing extra.',
    'amorfa.feature_1_title': 'Ship in hours',
    'amorfa.feature_1_body':
      'Batteries-included scaffold with auth, DB, caching, proxy, and CI already wired. Clone, edit .env, run.',
    'amorfa.feature_2_title': 'AI-first structure',
    'amorfa.feature_2_body':
      'Every file carries LLM-readable context. Repomix config, .agents/skills, and a documented file tree out of the box.',
    'amorfa.feature_3_title': 'Fullstack, honestly',
    'amorfa.feature_3_body':
      'FastAPI + SQLAlchemy 2.0 + Alembic on the backend. Next.js 16 App Router + Tailwind v4 on the frontend. One repo.',
    'amorfa.feature_4_title': 'Zero lock-in',
    'amorfa.feature_4_body':
      'No SaaS dashboards required. Docker Compose, Traefik, Postgres, Valkey — all self-hostable on a single VPS.',
    'amorfa.feature_5_title': 'Multi-service ready',
    'amorfa.feature_5_body':
      'The /services folder is a convention, not a constraint. Split into microservices when you actually need to.',
    'amorfa.feature_6_title': 'Documented defaults',
    'amorfa.feature_6_body':
      'Comments explain why, not what. JWT rotation, OTP, rate limiting, and email flows come pre-wired.',

    // ── Structure ───────────────────────────────────────────────────
    'amorfa.structure_eyebrow': 'Structure',
    'amorfa.structure_title': 'One repo — two services.',
    'amorfa.structure_body_1':
      'Monorepo by default: backend and frontend side by side, but isolated. Splitting into microservices is one docker-compose away, not a rewrite.',
    'amorfa.structure_body_2':
      'Every file carries LLM-agent context: comments, structure, .agents/skills. A Repomix config packs the whole project into a single readable document — feed it to the model whole.',

    // ── Stack ───────────────────────────────────────────────────────
    'amorfa.stack_eyebrow': 'Stack',
    'amorfa.stack_title': 'Modern, boring, reliable.',

    // ── Quickstart ──────────────────────────────────────────────────
    'amorfa.quickstart_eyebrow': 'Quick start',
    'amorfa.quickstart_title': 'Three commands to a working app.',
    'amorfa.step_1_title': 'Clone and configure',
    'amorfa.step_2_title': 'Bring up containers',
    'amorfa.step_3_title': 'Run migrations',
    'amorfa.quickstart_cta': 'All instructions on GitHub',

    // ── CTA ─────────────────────────────────────────────────────────
    'amorfa.cta_title_1': 'Open source.',
    'amorfa.cta_title_2': 'Your move.',
    'amorfa.cta_body':
      'Fork it, extend it, send a PR. Amorfa lives as long as people use it.',
    'amorfa.cta_home': '← Back home',
  },

  ru: {
    // ── Hero ────────────────────────────────────────────────────────
    'amorfa.eyebrow': 'Open source · Юнидока',
    'amorfa.title_1': 'Amorfa.',
    'amorfa.title_2': 'Fullstack за часы, а не недели.',
    'amorfa.description':
      'AI-оптимизированный fullstack-фреймворк: FastAPI, Next.js, PostgreSQL и Valkey — всё подключено, задокументировано и самохостится. Клонируйте репозиторий и начинайте строить то, что действительно хотели.',
    'amorfa.cta_github': 'Открыть на GitHub',
    'amorfa.cta_quickstart': 'Быстрый старт',

    // ── Features ────────────────────────────────────────────────────
    'amorfa.features_eyebrow': 'Что внутри',
    'amorfa.features_title':
      'Всё, что нужно для продакшена — и ничего лишнего.',
    'amorfa.feature_1_title': 'Запуск за часы',
    'amorfa.feature_1_body':
      'Скаффолд со всем включённым: авторизация, БД, кэш, прокси и CI уже настроены. Клонируй, отредактируй .env, запускай.',
    'amorfa.feature_2_title': 'AI-first структура',
    'amorfa.feature_2_body':
      'Каждый файл несёт LLM-читаемый контекст. Конфиг Repomix, .agents/skills и задокументированное дерево файлов — из коробки.',
    'amorfa.feature_3_title': 'Fullstack, честно',
    'amorfa.feature_3_body':
      'FastAPI + SQLAlchemy 2.0 + Alembic на бэкенде. Next.js 16 App Router + Tailwind v4 на фронтенде. Один репозиторий.',
    'amorfa.feature_4_title': 'Ноль lock-in',
    'amorfa.feature_4_body':
      'Никаких SaaS-панелей. Docker Compose, Traefik, Postgres, Valkey — всё самохостится на одном VPS.',
    'amorfa.feature_5_title': 'Готов к микросервисам',
    'amorfa.feature_5_body':
      'Папка /services — это конвенция, а не ограничение. Разделяйте на микросервисы, когда это реально нужно.',
    'amorfa.feature_6_title': 'Задокументированные дефолты',
    'amorfa.feature_6_body':
      'Комментарии объясняют «почему», а не «что». JWT-ротация, OTP, rate limiting и email-флоу — уже подключены.',

    // ── Structure ───────────────────────────────────────────────────
    'amorfa.structure_eyebrow': 'Структура',
    'amorfa.structure_title': 'Один репозиторий — два сервиса.',
    'amorfa.structure_body_1':
      'Монорепо по умолчанию: бэкенд и фронтенд рядом, но изолированы. Разделение на микросервисы — вопрос одного docker-compose, а не переписывания.',
    'amorfa.structure_body_2':
      'Каждый файл несёт контекст для LLM-агента: комментарии, структура, .agents/skills. Repomix-конфиг собирает весь проект в один читаемый документ — можно скармливать модели целиком.',

    // ── Stack ───────────────────────────────────────────────────────
    'amorfa.stack_eyebrow': 'Стек',
    'amorfa.stack_title': 'Современный, скучный, надёжный.',

    // ── Quickstart ──────────────────────────────────────────────────
    'amorfa.quickstart_eyebrow': 'Быстрый старт',
    'amorfa.quickstart_title': 'Три команды до работающего приложения.',
    'amorfa.step_1_title': 'Клонировать и настроить',
    'amorfa.step_2_title': 'Поднять контейнеры',
    'amorfa.step_3_title': 'Применить миграции',
    'amorfa.quickstart_cta': 'Все инструкции на GitHub',

    // ── CTA ─────────────────────────────────────────────────────────
    'amorfa.cta_title_1': 'Открытый исходный код.',
    'amorfa.cta_title_2': 'Ваш ход.',
    'amorfa.cta_body':
      'Форкайте, дописывайте, присылайте PR. Amorfa живёт, пока её используют.',
    'amorfa.cta_home': '← На главную',
  },
};
