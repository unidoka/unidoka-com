"use client";

import { ROUTES } from "@/utils/constants/routes";
import {
  TelegramLogotypeMonoIcon,
  GithubLogotypeMonoIcon,
} from "@/components/icons";
import { Button } from "../../ui/button";
import { Container } from "../../ui/container";
import LogoIcon from "@/components/layout/logo/logo-icon";
import { NavLink } from "./nav-link";
import { ThemeSwitcher } from "../theme-switcher";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/providers/language-provider";
import { useRootHref } from "@/hooks/use-root-href";
import { rootDomainUrl } from "@/utils/root-domain";
import { SERVICES_META } from "@/app/_data/services/meta";
import Link from "next/link";

/* ── Socials: only GitHub + Telegram ───────────────────────────── */
const SOCIALS = [
  {
    label: "Telegram",
    href: "https://t.me/unidoka",
    Icon: TelegramLogotypeMonoIcon,
  },
  {
    label: "GitHub",
    href: "https://github.com/unidoka",
    Icon: GithubLogotypeMonoIcon,
  },
];

/* ── Legal docs - one entry per document the site actually ships ── */
const LEGAL_DOCS: { key: string; href: string }[] = [
  { key: "footer.legal.privacy", href: "/docs/privacy" },
  { key: "footer.legal.consent", href: "/docs/consent" },
  { key: "footer.legal.cookies", href: "/docs/cookies" },
  { key: "footer.legal.terms", href: "/docs/terms" },
  { key: "footer.legal.reviews", href: "/docs/reviews-consent" },
];

export default function Footer() {
  const { t } = useLanguage();
  const logoHref = useRootHref();
  const rootLink = (path: string) => rootDomainUrl(path);

  // Agency column - depends on language, not on host. Names come from
  // i18n so RU shows "Юнидока" and EN shows "Unidoka".
  const agencyLinks = [
    { title: t("footer.projects"), href: rootLink(ROUTES.projects.href) },
    { title: t("footer.about"), href: rootLink(ROUTES.about.href) },
    { title: t("footer.amorfa"), href: rootLink("/amorfa") },
    { title: t("footer.journal"), href: rootLink(ROUTES.blog.href) },
    {
      title: t("footer.careers"),
      href: "https://forms.yandex.com/u/69975d0849af47b15b4c80df",
    },
  ];

  // Services column, sourced from the shared meta so it never drifts.
  const serviceLinks = SERVICES_META.map((s) => ({
    title: s.shortTitle,
    href: rootLink(`/services/${s.slug}`),
  }));

  const pathname = usePathname();
  const isFullWidth =
    pathname?.startsWith("/admin") || pathname?.startsWith("/app/profile");

  const year = new Date().getFullYear();

  return (
    <footer className="bg-(--bg) pt-20 pb-32 border-t border-(--outline)">
      <Container variant={isFullWidth ? "full-width" : "default"}>
        {/* Four columns: brand · agency · services · legal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-12 lg:gap-10 mb-20">
          {/* Brand */}
          <div className="flex flex-col gap-6 max-w-sm">
            <Link href={logoHref} className="w-fit">
              <LogoIcon className="h-8! w-auto" />
            </Link>
            <p className="text-body-4 text-(--on-bg-medium) leading-relaxed">
              {t("footer.tagline")}
            </p>
            <div className="flex items-center gap-1">
              {SOCIALS.map(({ label, href, Icon }) => (
                <Button
                  key={label}
                  variant="text"
                  size="icon-small"
                  asChild
                  className="hover:bg-(--primary-glass)!"
                >
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    <Icon />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Agency column */}
          <div className="flex flex-col gap-4">
            <h4 className="text-body-4 font-bold uppercase tracking-widest text-(--on-bg-low)">
              {t("footer.agency")}
            </h4>
            <ul className="flex flex-col gap-2">
              {agencyLinks.map((link) => (
                <li key={link.title}>
                  <NavLink
                    href={link.href}
                    className="text-body-3 text-(--on-bg-medium) hover:text-(--primary) transition-colors p-0 bg-transparent!"
                  >
                    {link.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Services column */}
          <div className="flex flex-col gap-4">
            <h4 className="text-body-4 font-bold uppercase tracking-widest text-(--on-bg-low)">
              {t("footer.services")}
            </h4>
            <ul className="flex flex-col gap-2">
              {serviceLinks.map((link) => (
                <li key={link.title}>
                  <NavLink
                    href={link.href}
                    className="text-body-3 text-(--on-bg-medium) hover:text-(--primary) transition-colors p-0 bg-transparent!"
                  >
                    {link.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal column - links to /docs/* */}
          <div className="flex flex-col gap-4">
            <h4 className="text-body-4 font-bold uppercase tracking-widest text-(--on-bg-low)">
              {t("footer.legal")}
            </h4>
            <ul className="flex flex-col gap-2">
              {LEGAL_DOCS.map(({ key, href }) => (
                <li key={key}>
                  <NavLink
                    href={rootLink(href)}
                    className="text-body-3 text-(--on-bg-medium) hover:text-(--primary) transition-colors p-0 bg-transparent! leading-snug"
                  >
                    {t(key)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pt-8 border-t border-(--outline)">
          <span className="text-body-5 text-(--on-bg-low)">
            {t("footer.copyright").replace("{year}", String(year))}
          </span>
          <ThemeSwitcher />
        </div>
      </Container>
    </footer>
  );
}
