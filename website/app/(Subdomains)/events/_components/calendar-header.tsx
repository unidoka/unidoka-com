"use client";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CaretLeft, CaretRight, Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { AddEventDialog } from "@/components/marketing/add-event-dialog";
import { cn } from "@/lib/utils";

export type ViewMode = "month" | "week" | "day" | "agenda";

interface Props {
  anchor: Date;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
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
  onPrev,
  onNext,
  onToday,
}: Props) {
  const title =
    view === "week"
      ? `${format(anchor, "d MMM", { locale: ru })} – ${format(
          new Date(anchor.getTime() + 6 * 86400000),
          "d MMM yyyy",
          { locale: ru }
        )}`
      : format(anchor, "LLLL yyyy", { locale: ru });

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-2">
        <Button variant="outlined" size="small" onClick={onToday}>
          Сегодня
        </Button>
        <div className="flex items-center rounded-xl border border-(--outline) bg-(--card) overflow-hidden">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Назад"
            className="size-9 flex items-center justify-center text-(--on-bg-medium) hover:bg-(--state-hover) transition-colors"
          >
            <CaretLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Вперёд"
            className="size-9 flex items-center justify-center text-(--on-bg-medium) hover:bg-(--state-hover) transition-colors border-l border-(--outline)"
          >
            <CaretRight className="size-4" />
          </button>
        </div>
        <h1 className="text-heading-2 md:text-display-4 capitalize ml-1 truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
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
