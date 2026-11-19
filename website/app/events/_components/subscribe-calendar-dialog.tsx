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
import { fetchIcalFeedUrl } from "@/utils/api/events";
import { cn } from "@/lib/utils";

const CALENDAR_NAME = "Unidoka — события";

interface Props {
  children: React.ReactNode;
}

export function SubscribeCalendarDialog({ children }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Подключить календарь</DialogTitle>
          <DialogDescription>
            События Unidoka появятся в вашем календаре и будут обновляться
            автоматически.
          </DialogDescription>
        </DialogHeader>
        <SubscribeContent />
      </DialogContent>
    </Dialog>
  );
}

function SubscribeContent() {
  const [url, setUrl] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetchIcalFeedUrl().then((u) => {
      if (!cancelled) setUrl(u);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (url === undefined) {
    return (
      <div className="flex items-center justify-center py-10 text-(--on-bg-low)">
        <CircleNotch className="size-5 animate-spin" />
      </div>
    );
  }

  if (!url) {
    return (
      <p className="py-6 text-center text-body-4 text-(--on-bg-medium)">
        Календарь пока не настроен.
      </p>
    );
  }

  const encoded = encodeURIComponent(url);
  const name = encodeURIComponent(CALENDAR_NAME);
  const webcal = url.replace(/^https:\/\//, "webcal://");

  const links = [
    {
      id: "google",
      label: "Google Календарь",
      icon: <GoogleCalendarLogotypeIcon className="size-5" />,
      href: `https://calendar.google.com/calendar/render?cid=${encoded}`,
    },
    {
      id: "yandex",
      label: "Яндекс Календарь",
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
      label: "Apple Календарь",
      icon: <AppleLogotypeIcon className="size-5" />,
      href: webcal,
    },
    {
      id: "notion",
      label: "Notion Calendar",
      icon: <NotionLogotypeIcon className="size-5" />,
      href: null,
    },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Ссылка на календарь скопирована");
    } catch {
      toast.error("Не удалось скопировать ссылку");
    }
  };

  const copyFor = async (label: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(`Ссылка скопирована для ${label}`, {
        description: "Вставьте её в настройках календаря: «Добавить по ссылке».",
      });
    } catch {
      toast.error("Не удалось скопировать ссылку");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
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
              <span>{item.label}</span>
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
              <span>{item.label}</span>
              <Copy className="ml-auto size-4 text-(--on-bg-low)" />
            </button>
          ),
        )}
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-(--outline) bg-(--state-hover) p-2">
        <LinkSimple className="size-4 shrink-0 text-(--on-bg-low)" />
        <span className="min-w-0 flex-1 truncate text-body-5 text-(--on-bg-medium)">
          {url}
        </span>
        <Button variant="text" size="icon-small" onClick={copy} aria-label="Скопировать ссылку">
          <Copy className="size-4" />
        </Button>
      </div>

      <p className="text-body-5 text-(--on-bg-low)">
        Для других календарей скопируйте ссылку и добавьте её как подписку на
        календарь (iCal / ICS).
      </p>
    </div>
  );
}

const rowClass = cn(
  "flex items-center gap-3 rounded-xl border border-(--outline) px-3 py-2.5 text-left text-body-4 text-(--on-bg-high) transition-colors",
  "hover:border-(--on-bg-low) hover:bg-(--state-hover)",
);
