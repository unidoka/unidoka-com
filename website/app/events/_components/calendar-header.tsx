"use client";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Plus, SlidersHorizontal } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { AddEventDialog } from "@/components/marketing/add-event-dialog";
import { MonthYearPicker } from "./month-year-picker";
import { FilterPanel } from "./filter-panel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
}: Props) {
  const weekTitle = `${format(anchor, "d MMM", { locale: ru })} – ${format(
    new Date(anchor.getTime() + 6 * 86400000),
    "d MMM yyyy",
    { locale: ru }
  )}`;

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
          <h1 className="text-heading-2 md:text-display-4 capitalize truncate ml-1">
            {weekTitle}
          </h1>
        ) : (
          <MonthYearPicker anchor={anchor} onSelect={onAnchorChange} />
        )}

        {/* Add event — desktop only, on the right */}
        <div className="hidden lg:flex items-center gap-2 ml-auto shrink-0">
          <AddEventDialog>
            <Button size="medium" shape="round">
              <Plus /> Добавить событие
            </Button>
          </AddEventDialog>
        </div>
      </div>

      {/* Row 2: view switcher (scrollable) + mobile actions */}
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

        {/* Mobile actions — filter + add (both hidden at lg+) */}
        <div className="flex items-center gap-2 ml-auto lg:hidden shrink-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outlined"
                size="icon-small"
                aria-label="Открыть фильтры"
                className="size-9"
              >
                <SlidersHorizontal className="size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Фильтры</DialogTitle>
              </DialogHeader>
              <FilterPanel
                allEvents={allEvents}
                value={filter}
                onChange={onFilterChange}
                compact
              />
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
