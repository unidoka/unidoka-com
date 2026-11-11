"use client";

import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Plus, SlidersHorizontal, CalendarBlank } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { AddEventDialog } from "@/components/marketing/add-event-dialog";
import { MonthYearPicker } from "./month-year-picker";
import { FilterPanel } from "./filter-panel";
import { MiniMonth } from "./mini-month";
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
}

const VIEWS: { id: ViewMode; label: string; short: string }[] = [
  { id: "month", label: "Месяц", short: "Мес" },
  { id: "week", label: "Неделя", short: "Нед" },
  { id: "day", label: "День", short: "Дн" },
  { id: "agenda", label: "Список", short: "Сп" },
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
}: Props) {
  const startDay = anchor;
  const endDay = new Date(anchor.getTime() + 6 * 86400000);
  const isSameMonth = startDay.getMonth() === endDay.getMonth();
  
  const weekTitle = isSameMonth
    ? `${format(startDay, "d", { locale: ru })} – ${format(endDay, "d MMM yyyy", { locale: ru })}`
    : `${format(startDay, "d MMM", { locale: ru })} – ${format(endDay, "d MMM yyyy", { locale: ru })}`;

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: nav + title + add (add only visible on lg) */}
      <div className="flex items-center gap-2 min-w-0">
        <Button variant="outlined" size="small" onClick={onToday}>
          Сегодня
        </Button>
        
        <div className="flex items-center rounded-xl border border-(--outline) bg-(--card) overflow-hidden shrink-0">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Предыдущий"
            className="size-9 flex items-center justify-center text-lg leading-none text-(--on-bg-medium) hover:bg-(--state-hover) hover:text-(--on-bg-high) transition-colors"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Следующий"
            className="size-9 flex items-center justify-center text-lg leading-none text-(--on-bg-medium) hover:bg-(--state-hover) hover:text-(--on-bg-high) transition-colors border-l border-(--outline)"
          >
            ›
          </button>
        </div>
        
        {view === "week" ? (
          <h1 className="text-heading-3 md:text-heading-2 font-medium tracking-tight truncate ml-1">
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

        <div className="hidden lg:flex items-center gap-2 ml-auto shrink-0">
          <AddEventDialog>
            <Button size="medium" shape="round">
              <Plus /> Добавить событие
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
                "px-2.5 sm:px-3 h-8 rounded-lg text-body-5 sm:text-body-4 font-medium transition-colors whitespace-nowrap shrink-0",
                view === v.id
                  ? "bg-(--on-bg-high) text-(--bg)"
                  : "text-(--on-bg-medium) hover:text-(--on-bg-high)"
              )}
            >
              <span className="sm:hidden">{v.short}</span>
              <span className="hidden sm:inline">{v.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto lg:hidden shrink-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outlined" size="icon-small" aria-label="Фильтры" className="size-9">
                <SlidersHorizontal className="size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Фильтры</DialogTitle>
              </DialogHeader>
              <FilterPanel allEvents={allEvents} value={filter} onChange={onFilterChange} compact />
            </DialogContent>
          </Dialog>
          <AddEventDialog>
            <Button size="icon-small" shape="round" className="size-9" aria-label="Добавить событие">
              <Plus className="size-4" />
            </Button>
          </AddEventDialog>
        </div>
      </div>
    </div>
  );
}
