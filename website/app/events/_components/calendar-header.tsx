"use client";

import { useState } from "react";
import { format } from "date-fns";
import { enUS, ru } from "date-fns/locale";
import {
  ArrowCounterClockwise,
  CalendarBlank,
  CalendarPlus,
  DotsThree,
  MagnifyingGlassIcon,
  Plus,
  SlidersHorizontal,
} from "@phosphor-icons/react";
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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  onSearch: () => void;
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
  onSearch,
  locale,
}: Props) {
  const { lang, t } = useLanguage();
  const dateLocale = lang === "en" ? enUS : ru;
  const startDay = anchor;
  const endDay = new Date(anchor.getTime() + 6 * 86400000);
  const isSameMonth = startDay.getMonth() === endDay.getMonth();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  const weekTitle = isSameMonth
    ? `${format(startDay, "d", { locale: dateLocale })} - ${format(endDay, lang === "en" ? "MMM d, yyyy" : "d MMM yyyy", { locale: dateLocale })}`
    : `${format(startDay, lang === "en" ? "MMM d" : "d MMM", { locale: dateLocale })} - ${format(endDay, lang === "en" ? "MMM d, yyyy" : "d MMM yyyy", { locale: dateLocale })}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex min-w-0 items-center gap-0.5">
        <button
          type="button"
          onClick={onPrev}
          aria-label={t("events.calendar.prev")}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-lg leading-none text-(--on-bg-medium) transition-colors hover:bg-(--state-hover) hover:text-(--on-bg-high)"
        >
          ‹
        </button>

        {view === "week" ? (
          <h1 className="ml-1 truncate text-heading-3 tracking-tight md:text-heading-2">
            {weekTitle}
          </h1>
        ) : (
          <MonthYearPicker anchor={anchor} onSelect={onAnchorChange} />
        )}

        <button
          type="button"
          onClick={onNext}
          aria-label={t("events.calendar.next")}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-lg leading-none text-(--on-bg-medium) transition-colors hover:bg-(--state-hover) hover:text-(--on-bg-high)"
        >
          ›
        </button>
      </div>

      <div className="order-3 flex w-full max-w-full items-center gap-0.5 overflow-x-auto lg:order-2 lg:w-auto">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => onViewChange(v.id)}
            className={cn(
              "h-8 shrink-0 whitespace-nowrap rounded-lg px-2.5 text-body-5 transition-colors sm:px-3 sm:text-body-4",
              view === v.id
                ? "bg-(--state-hover) text-(--on-bg-high)"
                : "text-(--on-bg-low) hover:text-(--on-bg-high)",
            )}
          >
            <span className="sm:hidden">{t(v.shortKey)}</span>
            <span className="hidden sm:inline">{t(v.labelKey)}</span>
          </button>
        ))}
      </div>

      <div className="order-2 ml-auto flex shrink-0 items-center gap-1 lg:order-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="text"
              size="icon-medium"
              aria-label={t("events.calendar.more")}
              title={t("events.calendar.more")}
            >
              <DotsThree className="size-5" weight="bold" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[210px]">
            <DropdownMenuItem
              onSelect={onSearch}
              className="gap-2 px-2 py-2 text-body-4"
            >
              <MagnifyingGlassIcon className="size-4" />
              {t("events.search.trigger")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setSubscribeOpen(true)}
              className="gap-2 px-2 py-2 text-body-4"
            >
              <CalendarPlus className="size-4" />
              {t("events.calendar.subscribe")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={onToday}
              className="gap-2 px-2 py-2 text-body-4"
            >
              <ArrowCounterClockwise className="size-4" />
              {t("events.calendar.today")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setDateOpen(true)}
              className="gap-2 px-2 py-2 text-body-4 lg:hidden"
            >
              <CalendarBlank className="size-4" />
              {t("events.calendar.choose_date")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setFiltersOpen(true)}
              className="gap-2 px-2 py-2 text-body-4 lg:hidden"
            >
              <SlidersHorizontal className="size-4" />
              {t("events.calendar.filters")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AddEventDialog>
          <Button
            size="icon-medium"
            className="lg:hidden"
            aria-label={t("events.calendar.add_event")}
          >
            <Plus className="size-5" />
          </Button>
        </AddEventDialog>
        <AddEventDialog>
          <Button size="medium" className="hidden lg:inline-flex">
            <Plus /> {t("events.calendar.add_event")}
          </Button>
        </AddEventDialog>
      </div>

      <SubscribeCalendarDialog
        locale={locale}
        open={subscribeOpen}
        onOpenChange={setSubscribeOpen}
      />

      <Dialog open={dateOpen} onOpenChange={setDateOpen}>
        <DialogContent className="w-auto p-3 sm:max-w-fit" showCloseButton={false}>
          <DialogHeader className="sr-only">
            <DialogTitle>{t("events.calendar.choose_date")}</DialogTitle>
          </DialogHeader>
          <MiniMonth
            month={anchor}
            selected={selected}
            eventDays={eventDays}
            onMonthChange={onAnchorChange}
            onSelect={(d) => {
              onSelectDate(d);
              onAnchorChange(d);
              setDateOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("events.calendar.filters")}</DialogTitle>
          </DialogHeader>
          <FilterPanel
            allEvents={allEvents}
            value={filter}
            onChange={onFilterChange}
            compact
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
