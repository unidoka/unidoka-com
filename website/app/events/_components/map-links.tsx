"use client";

import { Button } from "@/components/ui/button";
import {
  GoogleMapsLogotypeIcon,
  YandexMapsLogotypeIcon,
} from "@/components/icons";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

interface Props {
  query: string;
  className?: string;
}

export function MapLinks({ query, className }: Props) {
  const { lang, t } = useLanguage();
  const value = query.trim();
  if (!value) return null;

  const encoded = encodeURIComponent(value);
  const yandexMaps = lang === "en"
    ? `https://yandex.com/maps/?text=${encoded}`
    : `https://yandex.ru/maps/?text=${encoded}`;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Button variant="outlined" size="small" asChild>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encoded}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <GoogleMapsLogotypeIcon className="size-4" />
          {t("events.maps.google")}
        </a>
      </Button>
      <Button variant="outlined" size="small" asChild>
        <a
          href={yandexMaps}
          target="_blank"
          rel="noopener noreferrer"
        >
          <YandexMapsLogotypeIcon className="size-4" />
          {t("events.maps.yandex")}
        </a>
      </Button>
    </div>
  );
}
