"use client";

import { useMemo } from "react";
import {
  CopyIcon,
  LinkSimpleIcon,
  ShareNetworkIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import { LinkedInLogoIcon } from "@/components/icons/logotypes/linkedin-logo-icon";
import { MaxLogoIcon } from "@/components/icons/logotypes/max-logo-icon";
import { TelegramLogotypeMonoIcon } from "@/components/icons/logotypes/telegram-logo-mono-icon";
import { VKLogoIcon } from "@/components/icons/logotypes/vk-logo-icon";
import { XLogoBrandIcon } from "@/components/icons/logotypes/x-logo-icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLanguage } from "@/providers/language-provider";
import type { EventsLocale } from "@/utils/api/events";

interface ShareEventDialogProps {
  title: string;
  url: string;
  locale: EventsLocale;
  dateLabel?: string;
  location?: string;
  organizer?: string;
  price?: string;
  trigger?: React.ReactNode;
}

export function ShareEventDialog({
  title,
  url,
  locale,
  dateLabel,
  location,
  organizer,
  price,
  trigger,
}: ShareEventDialogProps) {
  const { t } = useLanguage();
  const info = useMemo(() => {
    const details = [
      title,
      dateLabel ? `${t("events.when")}: ${dateLabel}` : "",
      location ? `${t("events.where")}: ${location}` : "",
      organizer ? `${t("events.details.organizer")}: ${organizer}` : "",
      price ? `${t("events.price")}: ${price}` : "",
    ].filter(Boolean);

    // The link always sits on its own line at the bottom.
    return [...details, "", url].join("\n");
  }, [title, dateLabel, location, organizer, price, url, t]);

  const copy = async (value: string, successKey: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(t(successKey));
    } catch {
      toast.error(t("events.share.copy_failed"));
    }
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedInfo = encodeURIComponent(info);

  const socials = [
    {
      key: "telegram",
      label: t("events.share.telegram"),
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      icon: <TelegramLogotypeMonoIcon className="size-6 [&_path]:fill-current" />,
    },
    {
      key: "x",
      label: t("events.share.x"),
      href: `https://x.com/intent/post?url=${encodedUrl}&text=${encodedTitle}`,
      icon: <XLogoBrandIcon className="size-6" />,
    },
    {
      key: "linkedin",
      label: t("events.share.linkedin"),
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: <LinkedInLogoIcon className="size-6" />,
    },
    ...(locale === "ru"
      ? [
          {
            key: "vk",
            label: t("events.share.vk"),
            href: `https://vk.com/share.php?url=${encodedUrl}&title=${encodedTitle}`,
            icon: <VKLogoIcon className="size-6" />,
          },
          {
            key: "max",
            label: t("events.share.max"),
            href: `https://max.ru/share?text=${encodedInfo}`,
            icon: <MaxLogoIcon className="size-6" />,
          },
        ]
      : []),
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="outlined"
            size="icon-medium"
            shape="round"
            aria-label={t("events.share.trigger")}
            title={t("events.share.trigger")}
          >
            <ShareNetworkIcon className="size-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100%-2rem)] gap-0 overflow-hidden border-(--outline) bg-(--card) p-0 sm:max-w-[560px] md:max-w-[680px] lg:max-w-[680px]">
        <DialogHeader className="border-b border-(--outline) px-7 pb-5 pt-7">
          <DialogTitle className="text-display-4 leading-[1.05]">
            {t("events.share.title")}
          </DialogTitle>
          <p className="mt-2 text-body-4 text-(--on-bg-medium)">
            {t("events.share.description")}
          </p>
        </DialogHeader>

        <div className="flex flex-wrap items-center justify-center gap-3 p-7">
          <Button
            variant="tonal-card"
            size="icon-large"
            shape="round"
            onClick={() => copy(url, "events.share.link_copied")}
            aria-label={t("events.share.copy_link")}
            title={t("events.share.copy_link")}
          >
            <LinkSimpleIcon className="size-6" />
          </Button>
          <Button
            variant="outlined"
            size="icon-large"
            shape="round"
            onClick={() => copy(info, "events.share.info_copied")}
            aria-label={t("events.share.copy_info")}
            title={t("events.share.copy_info")}
          >
            <CopyIcon className="size-6" />
          </Button>

          <span aria-hidden className="mx-1 hidden h-8 w-px bg-(--outline) sm:block" />

          {socials.map((social) => (
            <Button
              key={social.key}
              variant="tonal-card"
              size="icon-large"
              shape="round"
              asChild
            >
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                title={social.label}
              >
                {social.icon}
              </a>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ShareEventDialog;
