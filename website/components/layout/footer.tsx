import { getTranslations } from "next-intl/server";
import { ROUTES } from "@/utils/constants/routes";
import {
  DprofileLogotypeMonoIcon,
  TelegramLogotypeMonoIcon,
  VKLogotypeMonoIcon,
} from "@/components/icons";
import { GithubLogotypeMonoIcon } from "../icons";
import { Button } from "../ui/button";
import { Container } from "../ui/container";
import { NavLink } from "./nav-link";
import { ThemeSwitcher } from "./theme-switcher";
import Link from "next/link";
import Logo from "./logo/logo";

export default async function Footer() {
  const t = await getTranslations("Footer");

  const sections = [
    {
      title: t("agency"),
      links: [
        { title: t("webDev") /* TODO: real agency links */, href: ROUTES.projects.href },
        { title: t("services"), href: ROUTES.about.href },
        { title: t("careers"), href: "https://forms.yandex.com/u/69975d0849af47b15b4c80df" },
      ],
    },
    {
      title: t("services"),
      links: [
        { title: t("webDev"), href: ROUTES.order.href },
        { title: t("uxui"), href: ROUTES.order.href },
        { title: t("identity"), href: ROUTES.order.href },
        { title: t("motion"), href: ROUTES.order.href },
        { title: t("other"), href: ROUTES.order.href },
      ],
    },
  ];

  return (
    <footer className="bg-(--bg) pt-20 pb-32 border-t border-(--outline)">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-24 mb-20">
          <div className="flex flex-col gap-6 max-w-sm">
            <Link href="/" className="w-fit">
              <Logo className="h-8! w-auto" />
            </Link>
            <p className="text-body-3 text-(--on-bg-medium) leading-relaxed">
              {t("tagline")}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <SocialButton href="https://t.me/rovno_dev" icon={<TelegramLogotypeMonoIcon />} />
              <SocialButton href="https://vk.com/rovno_dev" icon={<VKLogotypeMonoIcon />} />
              <SocialButton href="https://github.com/rovno-dev" icon={<GithubLogotypeMonoIcon />} />
              <SocialButton href="https://dprofile.ru/rovno_dev" icon={<DprofileLogotypeMonoIcon />} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 sm:gap-16">
            {sections.map((section) => (
              <div key={section.title} className="flex flex-col gap-4">
                <h4 className="text-body-4 font-bold uppercase tracking-widest text-(--on-bg-low)">
                  {section.title}
                </h4>
                <ul className="flex flex-col gap-2">
                  {section.links.map((link) => (
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
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pt-8 border-t border-(--outline)">
          <span className="text-body-5 text-(--on-bg-low)">
            {t("copyright", { year: new Date().getFullYear() })}
          </span>
          <ThemeSwitcher />
        </div>
      </Container>
    </footer>
  );
}

function SocialButton({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <Button variant="text" size="icon-small" asChild className="hover:bg-(--primary-glass)! group">
      <a href={href} target="_blank" rel="noopener noreferrer">
        {icon}
      </a>
    </Button>
  );
}
