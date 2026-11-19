"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowUpRight, CircleNotch, Copy, LinkSimple } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AppleLogotypeIcon,
  GoogleCalendarLogotypeIcon,
  NotionLogotypeIcon,
  OutlookLogotypeIcon,
  YandexLogotypeIcon,
} from "@/components/icons";
import {
  fetchIcalFeeds,
  type EventsCategory,
  type EventsLocale,
} from "@/utils/api/events";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  locale?: EventsLocale;
}

export function SubscribeCalendarDialog({ children, locale = "ru" }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85dvh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>
            <SubscribeTitle />
          </DialogTitle>
          <DialogDescription>
            <SubscribeDescription />
          </DialogDescription>
        </DialogHeader>
        <SubscribeContent locale={locale} />
      </DialogContent>
    </Dialog>
  );
}

function SubscribeTitle() {
  const { t } = useLanguage();
  return <>{t("events.subscribe.title")}</>;
}

function SubscribeDescription() {
  const { t } = useLanguage();
  return <>{t("events.subscribe.description")}</>;
}

const CATEGORY_TABS: { id: EventsCategory; key: string }[] = [
  { id: "activities", key: "events.calendar.activities" },
  { id: "competitions", key: "events.calendar.competitions" },
];

function SubscribeContent({ locale }: { locale: EventsLocale }) {
  const { t, lang } = useLanguage();
  const calendarName = lang === "en" ? "Unidoka — events" : "Unidoka — события";
  const [feeds, setFeeds] = useState<Partial<Record<EventsCategory, string>> | null>(
    null,
  );
  const [category, setCategory] = useState<EventsCategory>("activities");

  useEffect(() => {
    let cancelled = false;
    setFeeds(null);
    fetchIcalFeeds(locale).then((result) => {
      if (!cancelled) setFeeds(result);
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  if (feeds === null) {
    return (
      <div className="flex items-center justify-center py-10 text-(--on-bg-low)">
        <CircleNotch className="size-5 animate-spin" />
      </div>
    );
  }

  const url = feeds[category] ?? null;
  const hasAnyFeed = Object.values(feeds).some(Boolean);
  const categoryLabel = t(
    CATEGORY_TABS.find((tab) => tab.id === category)?.key ??
      "events.calendar.activities",
  );

  if (!hasAnyFeed) {
    return (
      <p className="py-6 text-center text-body-4 text-(--on-bg-medium)">
        {t("events.subscribe.not_configured")}
      </p>
    );
  }

  const encoded = url ? encodeURIComponent(url) : "";
  const name = encodeURIComponent(`${calendarName} — ${categoryLabel}`);
  const webcal = url ? url.replace(/^https:\/\//, "webcal://") : "";

  const links = url
    ? [
        {
          id: "google",
          label: t("events.subscribe.google"),
          icon: <GoogleCalendarLogotypeIcon className="size-5" />,
          href: `https://calendar.google.com/calendar/render?cid=${encoded}`,
        },
        {
          id: "yandex",
          label: t("events.subscribe.yandex"),
          icon: <YandexLogotypeIcon className="size-5" />,
          href: null,
        },
        {
          id: "outlook",
          label: "Outlook",
          icon: <OutlookLogotypeIcon className="size-5" />,
          href: `https://outlook.live.com/calendar/0/addfromweb?url=${encoded}&name=${name}`,
        },
        {
          id: "apple",
          label: t("events.subscribe.apple"),
          icon: <AppleLogotypeIcon className="size-5" />,
          href: webcal,
        },
        {
          id: "notion",
          label: "Notion Calendar",
          icon: <NotionLogotypeIcon className="size-5" />,
          href: null,
        },
      ]
    : [];

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("events.subscribe.copied"));
    } catch {
      toast.error(t("events.subscribe.copy_failed"));
    }
  };

  const copyFor = async (label: string) => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(
        t("events.subscribe.copied_for").replace("{name}", label),
        { description: t("events.subscribe.paste_hint") },
      );
    } catch {
      toast.error(t("events.subscribe.copy_failed"));
    }
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-(--state-hover) p-1">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCategory(tab.id)}
            className={cn(
              "rounded-lg px-3 py-2 text-body-5 transition-colors",
              category === tab.id
                ? "bg-(--card) text-(--on-bg-high) shadow-sm"
                : "text-(--on-bg-medium) hover:text-(--on-bg-high)",
            )}
          >
            {t(tab.key)}
          </button>
        ))}
      </div>

      {url ? (
        <>
          <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2">
            {links.map((item) =>
              item.href ? (
                <a
                  key={item.id}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className={rowClass}
                >
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                  <ArrowUpRight className="ml-auto size-4 text-(--on-bg-low)" />
                </a>
              ) : (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => copyFor(item.label)}
                  className={rowClass}
                >
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                  <Copy className="ml-auto size-4 text-(--on-bg-low)" />
                </button>
              ),
            )}
          </div>

          <div className="flex w-full min-w-0 items-center gap-2 overflow-hidden rounded-xl border border-(--outline) bg-(--state-hover) p-2">
            <LinkSimple className="size-4 shrink-0 text-(--on-bg-low)" />
            <span
              className="block min-w-0 max-w-full flex-1 truncate text-body-5 text-(--on-bg-medium)"
              title={url}
            >
              {url}
            </span>
            <Button variant="text" size="icon-small" onClick={copy} aria-label={t("events.subscribe.copy_link")}>
              <Copy className="size-4" />
            </Button>
          </div>

          <p className="text-body-5 leading-snug text-(--on-bg-low)">
            {t("events.subscribe.other_hint")}
          </p>
        </>
      ) : (
        <p className="py-4 text-center text-body-4 text-(--on-bg-medium)">
          {t("events.subscribe.not_configured")}
        </p>
      )}
    </div>
  );
}

const rowClass = cn(
  "flex w-full min-w-0 items-center gap-3 rounded-xl border border-(--outline) px-3 py-2 text-left text-body-4 text-(--on-bg-high) transition-colors",
  "hover:border-(--on-bg-low) hover:bg-(--state-hover)",
);
