export interface ServiceMeta {
  slug: string;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  iconKey:
    | "palette"
    | "code"
    | "cube"
    | "film"
    | "megaphone"
    | "sparkle";
  accent: string;
  leadTime: string;
  startingAt: string;
}
export const SERVICES_META: ServiceMeta[] = [
  {
    slug: "branding",
    title: "Брендинг и айдентика",
    shortTitle: "Брендинг",
    tagline: "Логотип, фирменный стиль, брендбук",
    description:
      "Собираем визуальную систему бренда — от логотипа до гайдлайнов, по которым команда сможет работать годами.",
    iconKey: "palette",
    accent: "#A855F7",
    leadTime: "3–6 недель",
    startingAt: "от 75 000 ₽",
  },
  {
    slug: "web-development",
    title: "Веб-разработка",
    shortTitle: "Разработка",
    tagline: "Сайты, приложения, Mini Apps",
    description:
      "Проектируем и разрабатываем цифровые продукты на Next.js, FastAPI и PostgreSQL — от лендинга до продукта с биллингом.",
    iconKey: "code",
    accent: "#336DFF",
    leadTime: "4–12 недель",
    startingAt: "от 150 000 ₽",
  },
  {
    slug: "3d-motion",
    title: "3D и моушн-дизайн",
    shortTitle: "3D / Motion",
    tagline: "3D-модели, анимация, CGI",
    description:
      "Создаём 3D-модели, анимации и CGI-графику для промо, продуктов и корпоративных презентаций.",
    iconKey: "cube",
    accent: "#F2B441",
    leadTime: "2–8 недель",
    startingAt: "от 90 000 ₽",
  },
  {
    slug: "video-production",
    title: "Видеопродакшн",
    shortTitle: "Видео",
    tagline: "Промо-ролики, монтаж, склейка",
    description:
      "Полный цикл видеопродакшна: сценарий, съёмка, монтаж, цветокоррекция и звук. Один мастер-ролик — три версии под площадки.",
    iconKey: "film",
    accent: "#EF4444",
    leadTime: "2–6 недель",
    startingAt: "от 120 000 ₽",
  },
  {
    slug: "promotion",
    title: "Продвижение и реклама",
    shortTitle: "Продвижение",
    tagline: "SEO, таргет, контекст, SMM",
    description:
      "Настраиваем платный и органический трафик. Работаем с Яндекс Директ, таргетом и SEO — с прозрачной аналитикой.",
    iconKey: "megaphone",
    accent: "#10B981",
    leadTime: "постоянно",
    startingAt: "от 60 000 ₽/мес",
  },
  {
    slug: "ux-ui",
    title: "UX/UI-дизайн",
    shortTitle: "UX/UI",
    tagline: "Продуктовый дизайн, дизайн-системы",
    description:
      "Проектируем интерфейсы на основе исследований. Собираем дизайн-системы, по которым команда сможет расти без нас.",
    iconKey: "sparkle",
    accent: "#EC4899",
    leadTime: "3–10 недель",
    startingAt: "от 120 000 ₽",
  },
];
export function findServiceMeta(slug: string): ServiceMeta | null {
  return SERVICES_META.find((s) => s.slug === slug) ?? null;
}
