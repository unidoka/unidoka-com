"use client";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Plus, SlidersHorizontal } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { AddEventDialog } from "@/components/marketing/add-event-dialog";
import { MonthYearPicker } from "./month-year-picker";
import type { FilterState } from "./filters";
import type { EventItem } from "../_data/events";
import { FilterPanel } from "./filter-panel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

const VIEWS: { id: ViewMode; label: string }[] = [
  { id: "month", label: "Месяц" },
  { id: "week", label: "Неделя" },
  { id: "day", label: "День" },
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
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-2 min-w-0">
        <Button variant="outlined" size="small" onClick={onToday}>
          Сегодня
        </Button>

        {/* Prev / Next — text chevrons, no icon library */}
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

        {/* Title — click to pick month/year (week view uses a plain label) */}
        {view === "week" ? (
          <h1 className="text-heading-2 md:text-display-4 capitalize truncate ml-1">
            {weekTitle}
          </h1>
        ) : (
          <MonthYearPicker anchor={anchor} onSelect={onAnchorChange} />
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile-only filter trigger */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outlined"
              size="small"
              className="lg:hidden relative"
              aria-label="Открыть фильтры"
            >
              <SlidersHorizontal className="size-4" />
              Фильтры
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

        <div className="hidden sm:flex rounded-xl border border-(--outline) bg-(--card) p-0.5">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => onViewChange(v.id)}
              className={cn(
                "px-3 h-8 rounded-lg text-body-4 font-medium transition-colors",
                view === v.id
                  ? "bg-(--on-bg-high) text-(--bg)"
                  : "text-(--on-bg-medium) hover:text-(--on-bg-high)"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>

        <AddEventDialog>
          <Button size="medium" shape="round">
            <Plus /> <span className="hidden sm:inline">Добавить событие</span>
          </Button>
        </AddEventDialog>
      </div>
    </div>
  );
}
