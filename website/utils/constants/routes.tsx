import { ReactNode } from "react";

export interface RouteLinkProps {
  id?: string;
  href: string;
  title?: string | ReactNode;
}

export const ROUTES = {
  home: { id: "home", href: "/", title: "Главная" },

  // ── Primary nav (all root routes) ─────────────────────────────────
  solutions: { id: "solutions", href: "/services", title: "Решения" },
  api:       { id: "api",       href: "/docs",     title: "Unidoka API" },
  crew:      { id: "crew",      href: "/about",    title: "Команда" },
  amorfa:    { id: "amorfa",    href: "/amorfa",   title: "Amorfa" },
  events:    { id: "events",    href: "/events",   title: "События" },
  vershiny:  { id: "vershiny",  href: "/vershiny", title: "Вершины" },

  // ── Legacy — still referenced by footer / admin / profile ─────────
  projects:  { id: "projects",  href: "/projects",  title: "Проекты" },
  services:  { id: "services",  href: "/services",  title: "Услуги" },
  companies: { id: "companies", href: "/companies", title: "Компании" },
  order:     { id: "order",     href: "/order",     title: "Оставить заявку" },
  about:     { id: "about",     href: "/about",     title: "О нас" },
  blog:      { id: "blog",      href: "/blog",      title: "Ровный блог" },
};
