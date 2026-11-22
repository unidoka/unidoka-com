"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { enUS, ru } from "date-fns/locale";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/providers/language-provider";
import type { EventListItem, EventsLocale } from "@/utils/api/events";
import { plainText } from "@/utils/events-seo";
import { shortId } from "@/utils/short-id";

interface EventsSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  events: EventListItem[];
  locale: EventsLocale;
}

function scoreEvent(event: EventListItem, query: string): number {
  if (!query) return 1;
  const title = plainText(event.title).toLowerCase();
  if (title === query) return 100;
  if (title.startsWith(query)) return 70;
  if (title.includes(query)) return 50;

  const haystack = [
    ...(event.tags ?? []).map((tag) => tag.name),
    event.city,
    event.location_name,
    event.organizer?.name,
    ...(event.categories ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query) ? 25 : 0;
}

export function EventsSearchDialog({
  open,
  onOpenChange,
  events,
  locale,
}: EventsSearchDialogProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const dateLocale = locale === "en" ? enUS : ru;
  const prefix = locale === "en" ? "/en" : "";

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // `code` is layout-independent: works on a Russian keyboard too.
      if (!(event.metaKey || event.ctrlKey) || event.code !== "KeyK") return;
      event.preventDefault();
      if (!event.repeat) {
        if (!open) setQuery("");
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange, open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events
      .map((event) => ({ event, score: scoreEvent(event, q) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (a.event.start_at || "").localeCompare(
          b.event.start_at || "",
        );
      })
      .slice(0, 7);
  }, [events, query]);

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    setQuery("");
  };

  const select = (event: EventListItem) => {
    handleOpenChange(false);
    router.push(`${prefix}/events/${shortId(event.id)}/${event.slug}`);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 gap-0 overflow-hidden sm:max-w-[560px] md:max-w-[720px]">
        <DialogHeader className="border-b border-(--outline) px-6 pb-4 pt-6">
          <DialogTitle className="text-display-4 leading-[1.05]">
            {t("events.search.title")}
          </DialogTitle>
        </DialogHeader>
        <Command className="bg-transparent p-2" shouldFilter={false}>
          <CommandInput
            autoFocus
            value={query}
            onValueChange={setQuery}
            placeholder={t("events.search.placeholder")}
          />
          <CommandList className="max-h-[420px]">
            <CommandEmpty>{t("events.search.empty")}</CommandEmpty>
            <CommandGroup>
              {results.map(({ event }) => {
                const start = event.start_at ? new Date(event.start_at) : null;
                const date =
                  start && !Number.isNaN(start.getTime())
                    ? format(start, "d MMM yyyy", { locale: dateLocale })
                    : null;
                const place = plainText(event.location_name || event.city);
                const meta = [date, place].filter(Boolean).join(" · ");

                return (
                  <CommandItem
                    key={event.id}
                    value={`${plainText(event.title)} ${event.id}`}
                    onSelect={() => select(event)}
                    className="cursor-pointer items-start gap-3 rounded-lg px-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-body-4 text-(--on-bg-high)">
                        {plainText(event.title)}
                      </p>
                      {meta && (
                        <p className="mt-0.5 truncate text-body-5 text-(--on-bg-medium)">
                          {meta}
                        </p>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export default EventsSearchDialog;
