import { ProjectCategoryCode, getProjectCategoryLabel } from "@/app/_data/categories";
import { CLIENTS, Client } from "../clients";
export type ProjectTagType = {
  title: string;
  href?: string;
}
export interface Project {
  id: string;
  slug: string;
  title: string;
  description?: string;
  shortDescription?: string;
  tags?: ProjectTagType[];
  cover: {
    videoSrc?: string;
    imageSrc: string;
  };
  href?: string;
  category: ProjectCategoryCode;
  clientId: string;
  platform?: string;
  period?: string;
  techStack?: string[];
  customPage?: string;
}
export const PROJECTS: Record<string, Project> = {
  vanguard: {
    id: "1",
    slug: "vanguard",
    title: "Vanguard: интернет-магазин электроники",
    description: "Полное переосмысление всего дизайна для интернет-магазина электроники и посты к 8 марта",
    shortDescription: "Редизайн интернет-магазина электроники с ростом конверсии +45%.",
    cover: {
      videoSrc: 'https://kinescope.io/74B6UBPTKLNKGBTunQ5bH8',
      imageSrc: '/static-images/projects/vanguard/vanguard-cover.png',
    },
    href: "https://dprofile.ru/case/116595/vanguard-internet-magazin-elektroniki",
    category: "e-commerce",
    clientId: "1",
    period: "2024",
    techStack: ["Figma", "Adobe Illustrator"],
  },
  alx: {
    customPage: "alx",
    id: "2",
    slug: "alx",
    title: "Чужой | ALX-9 - ИИ выставка",
    description: "Разработка фирменного стиля и веб-сайта для технологической компании ALX.",
    shortDescription: "Разработка айдентики и веб-сайта для технологической компании ALX.",
    cover: {
      videoSrc: 'https://kinescope.io/kbb8cwdAPa5tuNS7NDuDJm',
      imageSrc: '/static-images/projects/alx/alx-cover.png',
    },
    href: "https://dprofile.ru/case/124174/cuzoi-alx-9-ii-vystavka",
    category: "identity",
    clientId: "2",
    platform: "Веб-сайт",
    period: "2024",
    techStack: ["Figma", "After Effects"],
  },
  sadovod: {
    id: "3",
    slug: "sadovod",
    title: "Sadovod - Интернет магазин",
    description: "Интернет-магазин для крупнейшего рынка садовых товаров с удобным каталогом и корзиной.",
    shortDescription: "Интернет-магазин для крупнейшего рынка садовых товаров с удобным каталогом.",
    cover: {
      videoSrc: '',
      imageSrc: '/static-images/projects/sadovod/sadovod-cover.png',
    },
    href: "https://dprofile.ru/case/162985/sadovod-internet-magazin",
    category: "e-commerce",
    clientId: "3",
    period: "2024",
    techStack: ["Figma", "Adobe Illustrator"],
  },
  courtElegance: {
    id: "4",
    slug: "courtElegance",
    title: "The Court Elegance - Теннисный клуб",
    description: "Разработка сайта премиального теннисного клуба, расположенного в городе Остин, США, штат Техас.",
    shortDescription: "Сайт премиального теннисного клуба в Техасе, США.",
    cover: {
      videoSrc: '',
      imageSrc: '/static-images/projects/courtElegance/courtElegance-cover.png',
    },
    href: "https://dprofile.ru/case/160100/the-court-elegance-tennisnyi-klub",
    category: "e-commerce",
    clientId: "4",
    period: "2025",
    techStack: ["Figma", "Wix"],
  },
  bread: {
    customPage: "bread",
    id: "5",
    slug: "bread",
    title: "Хлебная Страна - Промо-ролик",
    description: "Разработка айдентики для продуктов серии Хлебная Страна от БКК",
    shortDescription: "Айдентика и промо-ролик для продуктовой серии «Хлебная Страна».",
    cover: {
      videoSrc: 'https://kinescope.io/7Y5P3U8JHseTQB8n6CgLjq',
      imageSrc: '/static-images/projects/bread/bread-cover.png',
    },
    href: "https://dprofile.ru/case/168046/xlebnaia-strana-promo-rolik",
    category: "identity",
    clientId: "5",
    period: "2026",
    techStack: ["Figma", "Blender", "Adobe After Effects", "Adobe Premier Pro", "Crita"],
  },
  concord: {
    id: "6",
    slug: "concord",
    title: "Concord Construction - Строительная компания",
    description: "Разработка дизайна сайта и айдентики для строительной компании",
    shortDescription: "Дизайн сайта и айдентика для строительной компании Concord Construction.",
    cover: {
      videoSrc: 'https://kinescope.io/3s92BgDF6MgamUYs3TtqJC',
      imageSrc: '/static-images/projects/concord/concord-cover.png',
    },
    href: "https://dprofile.ru/case/185165/concord-construction-stroitelnaia-kompaniia",
    category: "corporative",
    clientId: "6",
    period: "2025",
    techStack: ["Figma", "Adobe Illustrator", "Blender"],
  },
  lostPlay: {
    id: "7",
    slug: "lost-play",
    title: "Lost Play",
    description: "Разработка дизайна сайта и айдентики для строительной компании",
    shortDescription: "Дизайн сайта и айдентика для строительной компании Concord Construction.",
    cover: {
      videoSrc: '',
      imageSrc: '/static-images/projects/lostPlay/lostPlay-cover.png',
    },
    href: "https://dprofile.ru/case/185165/concord-construction-stroitelnaia-kompaniia",
    category: "corporative",
    clientId: "6",
    period: "2025",
    techStack: ["Figma", "Adobe Illustrator", "Blender"],
  },
};
