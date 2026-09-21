// Mock seed data. Swap for a real API call when the backend lands.
// Dates are spread across 2026-2027 so the calendar has something to show.

export type EventSource = "rosmolodez" | "roscongress";

export interface EventItem {
  id: string;
  title: string;
  description: string;
  source: EventSource;
  /** ISO 8601 */
  startsAt: string;
  endsAt?: string;
  location?: string;
  url?: string;
  tags?: string[];
  prize?: string;
}

export const SOURCE_LABEL: Record<EventSource, string> = {
  rosmolodez: "Росмолодёжь",
  roscongress: "Росконгресс",
};

export const SEED_EVENTS: EventItem[] = [
  // --- Росмолодёжь --------------------------------------------------
  {
    id: "rm-territoriya-2026",
    title: "Форум «Территория смыслов»",
    description:
      "Главная молодёжная образовательная площадка страны. Смены по IT, дизайну, медиа и предпринимательству.",
    source: "rosmolodez",
    startsAt: "2026-10-05",
    endsAt: "2026-10-12",
    location: "Сенеж, Московская область",
    url: "https://rosmolodez.gov.ru",
    tags: ["форум", "образование"],
  },
  {
    id: "rm-tvoy-hod-2026",
    title: "Конкурс «Твой Ход» — третий сезон",
    description:
      "Всероссийский конкурс для студентов: индивидуальные и командные треки, гранты и стажировки.",
    source: "rosmolodez",
    startsAt: "2026-10-01",
    endsAt: "2027-06-30",
    url: "https://tvoyhod.online",
    tags: ["конкурс", "грант"],
    prize: "до 1 000 000 ₽",
  },
  {
    id: "rm-evraziya-2026",
    title: "Международный форум «Евразия Global»",
    description:
      "Площадка для общения молодёжи из России и стран ЕАЭС. Панельные сессии, культурные обмены.",
    source: "rosmolodez",
    startsAt: "2026-09-25",
    endsAt: "2026-09-30",
    location: "Оренбург",
    url: "https://rosmolodez.gov.ru",
    tags: ["форум", "международное"],
  },
  {
    id: "rm-grants-wave-3",
    title: "Грантовый конкурс Росмолодёжи — III волна",
    description:
      "Приём заявок на гранты для молодёжных проектов. До 1.5 млн рублей на команду.",
    source: "rosmolodez",
    startsAt: "2026-11-01",
    endsAt: "2026-12-15",
    url: "https://myrosmol.ru",
    tags: ["грант"],
  },
  {
    id: "rm-baikal-2026",
    title: "Молодёжный форум «Байкал»",
    description:
      "Образовательный форум на Байкале: экология, урбанистика, креативные индустрии.",
    source: "rosmolodez",
    startsAt: "2026-11-15",
    endsAt: "2026-11-20",
    location: "Иркутская область",
    tags: ["форум"],
  },
  {
    id: "rm-ostrova-2027",
    title: "Молодёжный форум «ОстроVа»",
    description:
      "Тихоокеанский форум: карьера, предпринимательство, медиа и экология на Дальнем Востоке.",
    source: "rosmolodez",
    startsAt: "2027-07-10",
    endsAt: "2027-07-18",
    location: "Сахалин",
    tags: ["форум", "дальний-восток"],
  },
  {
    id: "rm-utro-2027",
    title: "Форум «УТРО»",
    description:
      "Образовательный форум Уральского федерального округа. Работа со всей страной.",
    source: "rosmolodez",
    startsAt: "2027-06-20",
    endsAt: "2027-06-26",
    location: "Челябинская область",
    tags: ["форум"],
  },

  // --- Росконгресс --------------------------------------------------
  {
    id: "rc-hack-transport-2026",
    title: "Хакатон Московского Транспорта",
    description:
      "Геймификация ВСМ, цифровые сервисы для пассажиров. Трек для продуктовых команд.",
    source: "roscongress",
    startsAt: "2026-09-25",
    endsAt: "2026-10-03",
    location: "Москва",
    url: "https://roscongress.org",
    tags: ["хакатон", "транспорт"],
    prize: "500 000 ₽",
  },
  {
    id: "rc-ren-2026",
    title: "Российская энергетическая неделя",
    description:
      "Международный форум по энергетике: нефть, газ, ВИЭ, водород. Деловая программа и выставка.",
    source: "roscongress",
    startsAt: "2026-10-15",
    endsAt: "2026-10-17",
    location: "Москва, Манеж",
    url: "https://rusenergyweek.com",
    tags: ["форум", "энергетика"],
  },
  {
    id: "rc-healthy-society-2026",
    title: "Форум «Здоровое общество»",
    description:
      "Демография, медицина, ЗОЖ. Ключевая площадка социальной повестки.",
    source: "roscongress",
    startsAt: "2026-10-22",
    endsAt: "2026-10-23",
    location: "Москва",
    url: "https://roscongress.org",
    tags: ["форум", "здоровье"],
  },
  {
    id: "rc-microelectronics-2026",
    title: "Форум «Микроэлектроника»",
    description:
      "Технологический форум о производстве чипов и электронной компонентной базы.",
    source: "roscongress",
    startsAt: "2026-11-05",
    endsAt: "2026-11-07",
    location: "Сочи, Сириус",
    tags: ["форум", "hardware"],
  },
  {
    id: "rc-made-in-russia-2026",
    title: "Форум «Сделано в России»",
    description:
      "Экспорт, промышленность, импортозамещение. Презентации регионов и компаний.",
    source: "roscongress",
    startsAt: "2026-11-19",
    endsAt: "2026-11-20",
    location: "Москва",
    tags: ["форум", "экспорт"],
  },
  {
    id: "rc-creative-week-2026",
    title: "Российская креативная неделя",
    description:
      "Фестиваль креативных индустрий: дизайн, кино, музыка, мода, геймдев.",
    source: "roscongress",
    startsAt: "2026-12-02",
    endsAt: "2026-12-05",
    location: "Москва",
    url: "https://creativeweek.ru",
    tags: ["фестиваль", "креатив"],
  },
  {
    id: "rc-pmef-2027",
    title: "Петербургский международный экономический форум (ПМЭФ)",
    description:
      "Главное деловое событие страны. Пленарные заседания, панели, подписание соглашений.",
    source: "roscongress",
    startsAt: "2027-06-02",
    endsAt: "2027-06-05",
    location: "Санкт-Петербург, Экспофорум",
    url: "https://forumspb.com",
    tags: ["форум", "экономика"],
  },
  {
    id: "rc-vef-2027",
    title: "Восточный экономический форум (ВЭФ)",
    description:
      "Развитие Дальнего Востока, сотрудничество со странами АТР.",
    source: "roscongress",
    startsAt: "2027-09-03",
    endsAt: "2027-09-06",
    location: "Владивосток",
    url: "https://forumvostok.ru",
    tags: ["форум", "атр"],
  },
  {
    id: "rc-invest-sochi-2027",
    title: "Российский инвестиционный форум",
    description: "Инвестиции, регионы, инфраструктурные проекты.",
    source: "roscongress",
    startsAt: "2027-02-15",
    endsAt: "2027-02-17",
    location: "Сочи",
    url: "https://roscongress.org",
    tags: ["форум", "инвестиции"],
  },
];
