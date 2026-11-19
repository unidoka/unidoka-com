"use client";

import { format } from "date-fns";
import { enUS, ru } from "date-fns/locale";
import { Plus, SlidersHorizontal, CalendarBlank, CalendarPlus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { AddEventDialog } from "@/components/marketing/add-event-dialog";
import { MonthYearPicker } from "./month-year-picker";
import { FilterPanel } from "./filter-panel";
import { MiniMonth } from "./mini-month";
import { SubscribeCalendarDialog } from "./subscribe-calendar-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { FilterState } from "./filters";
import type { EventItem } from "../_data/events";
import type { EventsLocale } from "@/utils/api/events";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

export type ViewMode = "month" | "week" | "day" | "agenda";

interface Props {
  anchor: Date;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  onAnchorChange: (d: Date) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  allEvents: EventItem[];
  filter: FilterState;
  onFilterChange: (f: FilterState) => void;
  eventDays: Set<string>;
  selected: Date;
  onSelectDate: (d: Date) => void;
  locale: EventsLocale;
}

const VIEWS: { id: ViewMode; labelKey: string; shortKey: string }[] = [
  { id: "month", labelKey: "events.calendar.month", shortKey: "events.calendar.month_short" },
  { id: "week", labelKey: "events.calendar.week", shortKey: "events.calendar.week_short" },
  { id: "day", labelKey: "events.calendar.day", shortKey: "events.calendar.day_short" },
  { id: "agenda", labelKey: "events.calendar.list", shortKey: "events.calendar.list_short" },
];

export function CalendarHeader({
  anchor,
  view,
  onViewChange,
  onAnchorChange,
  onPrev,
  onNext,
  onToday,
  allEvents,
  filter,
  onFilterChange,
  eventDays,
  selected,
  onSelectDate,
  locale,
}: Props) {
  const { lang, t } = useLanguage();
  const dateLocale = lang === "en" ? enUS : ru;
  const startDay = anchor;
  const endDay = new Date(anchor.getTime() + 6 * 86400000);
  const isSameMonth = startDay.getMonth() === endDay.getMonth();

  const weekTitle = isSameMonth
    ? `${format(startDay, "d", { locale: dateLocale })} – ${format(endDay, lang === "en" ? "MMM d, yyyy" : "d MMM yyyy", { locale: dateLocale })}`
    : `${format(startDay, lang === "en" ? "MMM d" : "d MMM", { locale: dateLocale })} – ${format(endDay, lang === "en" ? "MMM d, yyyy" : "d MMM yyyy", { locale: dateLocale })}`;

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: nav + title + add (add only visible on lg) */}
      <div className="flex items-center gap-2 min-w-0">
        <Button variant="outlined" size="small" onClick={onToday}>
          {t("events.calendar.today")}
        </Button>

        <div className="flex items-center rounded-xl border border-(--outline) bg-(--card) overflow-hidden shrink-0">
          <button
            type="button"
            onClick={onPrev}
            aria-label={t("events.calendar.prev")}
            className="size-9 flex items-center justify-center text-lg leading-none text-(--on-bg-medium) hover:bg-(--state-hover) hover:text-(--on-bg-high) transition-colors"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label={t("events.calendar.next")}
            className="size-9 flex items-center justify-center text-lg leading-none text-(--on-bg-medium) hover:bg-(--state-hover) hover:text-(--on-bg-high) transition-colors border-l border-(--outline)"
          >
            ›
          </button>
        </div>

        {view === "week" ? (
          <h1 className="text-heading-3 md:text-heading-2  tracking-tight truncate ml-1">
            {weekTitle}
          </h1>
        ) : (
          <MonthYearPicker anchor={anchor} onSelect={onAnchorChange} />
        )}

        {/* Mobile: MiniMonth Popover (Choose day) */}
        <div className="lg:hidden ml-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outlined" size="icon-small" className="size-9">
                <CalendarBlank className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-2 border-(--outline) bg-(--card) shadow-xl">
              <MiniMonth
                month={anchor}
                selected={selected}
                eventDays={eventDays}
                onMonthChange={onAnchorChange}
                onSelect={(d) => {
                  onSelectDate(d);
                  onAnchorChange(d);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="lg:hidden ml-auto">
          <SubscribeCalendarDialog locale={locale}>
            <Button
              variant="outlined"
              size="icon-small"
              aria-label={t("events.calendar.subscribe")}
              className="size-9"
            >
              <CalendarPlus className="size-4" />
            </Button>
          </SubscribeCalendarDialog>
        </div>

        <div className="hidden lg:flex items-center gap-2 ml-auto shrink-0">
          <SubscribeCalendarDialog locale={locale}>
            <Button variant="outlined" size="medium">
              <CalendarPlus /> {t("events.calendar.subscribe")}
            </Button>
          </SubscribeCalendarDialog>
          <AddEventDialog>
            <Button size="medium" >
              <Plus /> {t("events.calendar.add_event")}
            </Button>
          </AddEventDialog>
        </div>
      </div>

      {/* Row 2: view switcher + mobile actions */}
      <div className="flex items-center gap-2">
        <div className="flex rounded-xl border border-(--outline) bg-(--card) p-0.5 overflow-x-auto max-w-full">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => onViewChange(v.id)}
              className={cn(
                "px-2.5 sm:px-3 h-8 rounded-lg text-body-5 sm:text-body-4  transition-colors whitespace-nowrap shrink-0",
                view === v.id
                  ? "bg-(--on-bg-high) text-(--bg)"
                  : "text-(--on-bg-medium) hover:text-(--on-bg-high)"
              )}
            >
              <span className="sm:hidden">{t(v.shortKey)}</span>
              <span className="hidden sm:inline">{t(v.labelKey)}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto lg:hidden shrink-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outlined" size="icon-small" aria-label={t("events.calendar.filters")} className="size-9">
                <SlidersHorizontal className="size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("events.calendar.filters")}</DialogTitle>
              </DialogHeader>
              <FilterPanel allEvents={allEvents} value={filter} onChange={onFilterChange} compact />
            </DialogContent>
          </Dialog>
          <AddEventDialog>
            <Button size="icon-small" className="size-9" aria-label={t("events.calendar.add_event")}>
              <Plus className="size-4" />
            </Button>
          </AddEventDialog>
        </div>
      </div>
    </div>
  );
}
