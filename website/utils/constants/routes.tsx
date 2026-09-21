import { ReactNode } from "react";
export interface RouteLinkProps {
  id?: string,
  href: string,
  title?: string | ReactNode,
}
export const ROUTES = {
  home: { id: 'home', href: "/", title: 'Главная' },
  projects: { id: 'projects', href: "/projects", title: 'Проекты' },
  order: { id: 'order', href: "/order", title: 'Оставить заявку' },
  about: { id: 'about', href: "/about", title: 'О нас' },
  blog: { id: 'blog', href: "/blog", title: "Ровный блог" },
}
