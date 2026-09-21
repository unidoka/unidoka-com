"use client";
import Link from "next/link";
import {
  TelegramLogotypeMonoIcon,
  VKLogotypeMonoIcon,
  GithubLogotypeMonoIcon,
  DprofileLogotypeMonoIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import Logo from "./logo/logo";
import { ThemeSwitcher } from "./theme-switcher";
import { RequestDemoDialog } from "@/components/marketing/request-demo-dialog";
import { AddEventDialog } from "@/components/marketing/add-event-dialog";
import { useLanguage } from "@/providers/language-provider";
import { useHost } from "@/hooks/use-host";
import { buildNavLinks, resolveHref } from "@/utils/constants/nav-links";

const SOCIALS = [
  { label: "Telegram", href: "https://t.me/unidoka", Icon: TelegramLogotypeMonoIcon },
  { label: "VK", href: "https://vk.com/unidoka", Icon: VKLogotypeMonoIcon },
  { label: "GitHub", href: "https://github.com/unidoka", Icon: GithubLogotypeMonoIcon },
  { label: "Dprofile", href: "https://dprofile.ru/unidoka", Icon: DprofileLogotypeMonoIcon },
];

export default function Footer() {
  const { t } = useLanguage();
  const { subdomain, urlFor } = useHost();
  const navLinks = buildNavLinks(subdomain);
  const year = new Date().getFullYear();

  // Section title depends on host so the copy stays on-topic.
  const navTitle =
    subdomain === "events" ? "События" : subdomain === "0leak" ? "Продукт" : "Навигация";

  return (
    <footer className="border-t border-(--outline) bg-(--bg) mt-auto">
      <Container variant="full-width" className="pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr] gap-10 md:gap-16 mb-12">
          {/* Brand column */}
          <div className="flex flex-col gap-4 max-w-xs">
            <Link href="/" className="w-fit">
              <Logo className="h-8! w-auto" />
            </Link>
            <p className="text-body-4 text-(--on-bg-medium) leading-relaxed">
              {t("Footer.tagline")}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {SOCIALS.map(({ label, href, Icon }) => (
                <Button
                  key={label}
                  variant="text"
                  size="icon-small"
                  asChild
                  aria-label={label}
                  className="hover:bg-(--primary-glass)!"
                >
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    <Icon className="size-5" />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Nav column */}
          <div>
            <h4 className="text-body-5 font-semibold uppercase tracking-widest text-(--on-bg-low) mb-4">
              {navTitle}
            </h4>
            <ul className="flex flex-col gap-2.5">
              {navLinks.map((link) => {
                // "Добавить событие"
                if (link.dialog === "add-event") {
                  return (
                    <li key={link.label}>
                      <AddEventDialog>
                        <button
                          type="button"
                          className="text-body-4 text-(--on-bg-medium) hover:text-(--primary) transition-colors text-left"
                        >
                          {link.label}
                        </button>
                      </AddEventDialog>
                    </li>
                  );
                }
                // "Запросить демо"
                if (link.dialog === "request-demo") {
                  return (
                    <li key={link.label}>
                      <RequestDemoDialog>
                        <button
                          type="button"
                          className="text-body-4 text-(--on-bg-medium) hover:text-(--primary) transition-colors text-left"
                        >
                          {link.label}
                        </button>
                      </RequestDemoDialog>
                    </li>
                  );
                }
                const href = resolveHref(link, urlFor)!;
                const isExternal = !!link.target;
                return (
                  <li key={link.label}>
                    <Link
                      href={href}
                      {...(isExternal
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="text-body-4 text-(--on-bg-medium) hover:text-(--primary) transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Company column — depends on subdomain */}
          <div>
            <h4 className="text-body-5 font-semibold uppercase tracking-widest text-(--on-bg-low) mb-4">
              {t("Footer.agency")}
            </h4>
            <ul className="flex flex-col gap-2.5">
              {subdomain === "site" && (
                <>
                  <li>
                    <Link
                      href="/projects"
                      className="text-body-4 text-(--on-bg-medium) hover:text-(--primary) transition-colors"
                    >
                      Проекты
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/about"
                      className="text-body-4 text-(--on-bg-medium) hover:text-(--primary) transition-colors"
                    >
                      О нас
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/blog"
                      className="text-body-4 text-(--on-bg-medium) hover:text-(--primary) transition-colors"
                    >
                      {t("Footer.journal")}
                    </Link>
                  </li>
                  <li>
                    <a
                      href="https://forms.yandex.com/u/69975d0849af47b15b4c80df"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-body-4 text-(--on-bg-medium) hover:text-(--primary) transition-colors"
                    >
                      {t("Footer.careers")}
                    </a>
                  </li>
                </>
              )}
              {subdomain === "events" && (
                <>
                  <li>
                    <Link
                      href="/vershiny"
                      className="text-body-4 text-(--on-bg-medium) hover:text-(--primary) transition-colors"
                    >
                      Вершины
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/"
                      className="text-body-4 text-(--on-bg-medium) hover:text-(--primary) transition-colors"
                    >
                      Календарь событий
                    </Link>
                  </li>
                  <li>
                    <a
                      href={urlFor("", "/")}
                      className="text-body-4 text-(--on-bg-medium) hover:text-(--primary) transition-colors"
                    >
                      Про агентство
                    </a>
                  </li>
                </>
              )}
              {subdomain === "0leak" && (
                <>
                  <li>
                    <a
                      href="/#how"
                      className="text-body-4 text-(--on-bg-medium) hover:text-(--primary) transition-colors"
                    >
                      Как это работает
                    </a>
                  </li>
                  <li>
                    <a
                      href="/#why"
                      className="text-body-4 text-(--on-bg-medium) hover:text-(--primary) transition-colors"
                    >
                      Почему мы
                    </a>
                  </li>
                  <li>
                    <a
                      href="/#detectors"
                      className="text-body-4 text-(--on-bg-medium) hover:text-(--primary) transition-colors"
                    >
                      Датчики
                    </a>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-(--outline)">
          <span className="text-body-5 text-(--on-bg-low)">
            {t("Footer.copyright").replace("{year}", String(year))}
          </span>
          <ThemeSwitcher />
        </div>
      </Container>
    </footer>
  );
}
