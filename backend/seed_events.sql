-- ══════════════════════════════════════════════════════════════════════════
-- Events taxonomy seed. Idempotent — safe to re-run.
--
--   docker compose exec -T main-db \
--     psql -U "$MAIN_DB_USER" -d "$MAIN_DB_NAME" < backend/seed_events.sql
-- ══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── Directions ───────────────────────────────────────────────────────────
INSERT INTO event_directions (id, name, slug, emoji, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Software-разработка', 'software-razrabotka', '💻', 1, true, now(), now()),
  (gen_random_uuid(), 'Дизайн',               'dizayn',              '✍', 2, true, now(), now()),
  (gen_random_uuid(), 'Бизнес',               'biznes',              '💼', 3, true, now(), now()),
  (gen_random_uuid(), 'Hardware-разработка',  'hardware-razrabotka', '🤖', 4, true, now(), now())
ON CONFLICT (slug) DO UPDATE SET
  name       = EXCLUDED.name,
  emoji      = EXCLUDED.emoji,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- ── Subdirections (these are the event tags) ─────────────────────────────
-- Software-разработка
INSERT INTO event_subdirections (id, direction_id, name, slug, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), d.id, v.name, v.slug, v.sort_order, true, now(), now()
FROM event_directions d
CROSS JOIN (VALUES
  ('Веб-разработка',                             'veb-razrabotka',                            0),
  ('DevOps',                                     'devops',                                    1),
  ('ML',                                         'ml',                                        2),
  ('Flutter: desktop и мобильная разработка',    'flutter-desktop-mobile',                    3),
  ('Инфобез',                                    'infobez',                                   4),
  ('1С',                                         '1c',                                        5),
  ('UX/UI-дизайн',                               'ux-ui-dizayn',                              6)
) AS v(name, slug, sort_order)
WHERE d.slug = 'software-razrabotka'
ON CONFLICT (slug) DO UPDATE SET
  direction_id = EXCLUDED.direction_id,
  name         = EXCLUDED.name,
  sort_order   = EXCLUDED.sort_order,
  updated_at   = now();

-- Дизайн
INSERT INTO event_subdirections (id, direction_id, name, slug, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), d.id, v.name, v.slug, v.sort_order, true, now(), now()
FROM event_directions d
CROSS JOIN (VALUES
  ('3D',                  '3d',                  0),
  ('Видеопроизводство',   'videoproizvodstvo',   1),
  ('Графический дизайн',  'graficheskiy-dizayn', 2)
) AS v(name, slug, sort_order)
WHERE d.slug = 'dizayn'
ON CONFLICT (slug) DO UPDATE SET
  direction_id = EXCLUDED.direction_id,
  name         = EXCLUDED.name,
  sort_order   = EXCLUDED.sort_order,
  updated_at   = now();

-- Бизнес
INSERT INTO event_subdirections (id, direction_id, name, slug, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), d.id, v.name, v.slug, v.sort_order, true, now(), now()
FROM event_directions d
CROSS JOIN (VALUES
  ('Бизнес-аналитика и экономика', 'biznes-analitika-ekonomika', 0),
  ('SMM',                           'smm',                        1),
  ('Публичные выступления',         'publichnye-vystupleniya',    2)
) AS v(name, slug, sort_order)
WHERE d.slug = 'biznes'
ON CONFLICT (slug) DO UPDATE SET
  direction_id = EXCLUDED.direction_id,
  name         = EXCLUDED.name,
  sort_order   = EXCLUDED.sort_order,
  updated_at   = now();

-- Hardware-разработка
INSERT INTO event_subdirections (id, direction_id, name, slug, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), d.id, v.name, v.slug, v.sort_order, true, now(), now()
FROM event_directions d
CROSS JOIN (VALUES
  ('Разработка микроконтроллеров', 'razrabotka-mikrokontrollerov', 0),
  ('Дроны',                        'drony',                        1),
  ('3D-печать',                    '3d-pechat',                    2)
) AS v(name, slug, sort_order)
WHERE d.slug = 'hardware-razrabotka'
ON CONFLICT (slug) DO UPDATE SET
  direction_id = EXCLUDED.direction_id,
  name         = EXCLUDED.name,
  sort_order   = EXCLUDED.sort_order,
  updated_at   = now();

-- ── Event types ──────────────────────────────────────────────────────────
INSERT INTO event_types (id, name, slug, icon, color, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'IT',              'it',              'cpu',        '#3b82f6', 0,  true, now(), now()),
  (gen_random_uuid(), 'Бизнес',          'biznes-type',     'briefcase',  '#f59e0b', 1,  true, now(), now()),
  (gen_random_uuid(), 'Дизайн',          'dizayn-type',     'palette',    '#ec4899', 2,  true, now(), now()),
  (gen_random_uuid(), 'Досуг',           'dosug',           'coffee',     '#10b981', 3,  true, now(), now()),
  (gen_random_uuid(), 'Искусство',       'iskusstvo',       'paint-brush','#a855f7', 4,  true, now(), now()),
  (gen_random_uuid(), 'Дипломатия',      'diplomatiya',     'globe',      '#6366f1', 5,  true, now(), now()),
  (gen_random_uuid(), 'Строительство',   'stroitelstvo',    'buildings',  '#f97316', 6,  true, now(), now()),
  (gen_random_uuid(), 'Наука',           'nauka',           'flask',      '#06b6d4', 7,  true, now(), now()),
  (gen_random_uuid(), 'Медиа',           'media',           'megaphone',  '#ef4444', 8,  true, now(), now()),
  (gen_random_uuid(), 'Спорт',           'sport',           'barbell',    '#84cc16', 9,  true, now(), now())
ON CONFLICT (slug) DO UPDATE SET
  name       = EXCLUDED.name,
  icon       = EXCLUDED.icon,
  color      = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- ── Organizers ───────────────────────────────────────────────────────────
INSERT INTO organizers (id, name, slug, color, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Росмолодёжь',   'rosmolodezh',   '#336DFF', true, now(), now()),
  (gen_random_uuid(), 'Росконгресс',   'rosсongress',   '#E8590C', true, now(), now()),
  (gen_random_uuid(), 'Юнидока',       'unidoka',       '#0CA678', true, now(), now()),
  (gen_random_uuid(), 'unidoka.com',   'unidoka-com',   '#845EF7', true, now(), now())
ON CONFLICT (slug) DO UPDATE SET
  name       = EXCLUDED.name,
  color      = EXCLUDED.color,
  updated_at = now();

COMMIT;

-- ── Verify ───────────────────────────────────────────────────────────────
\echo ''
\echo '── Seed verification ──'
SELECT 'directions'       AS table, count(*) FROM event_directions       WHERE deleted_at IS NULL
UNION ALL SELECT 'subdirections',    count(*) FROM event_subdirections    WHERE deleted_at IS NULL
UNION ALL SELECT 'event_types',      count(*) FROM event_types           WHERE deleted_at IS NULL
UNION ALL SELECT 'organizers',       count(*) FROM organizers            WHERE deleted_at IS NULL;
