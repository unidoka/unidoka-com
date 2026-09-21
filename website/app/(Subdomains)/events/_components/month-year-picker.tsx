"use client";
import { useState } from "react";
import { format, setMonth, setYear } from "date-fns";
import { ru } from "date-fns/locale";
import { CaretDown } from "@phosphor-icons/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Props {
  anchor: Date;
  onSelect: (d: Date) => void;
}

// Russian short month labels (three letters), lowercase like the calendar header.
const MONTHS_SHORT = [
  "янв", "фев", "мар", "апр", "май", "июн",
  "июл", "авг", "сен", "окт", "ноя", "дек",
];

export function MonthYearPicker({ anchor, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(anchor.getFullYear());

  const currentMonth = anchor.getMonth();
  const currentYear = anchor.getFullYear();

  const pick = (monthIndex: number) => {
    onSelect(setMonth(setYear(anchor, viewYear), monthIndex));
    setOpen(false);
  };

  const openChange = (v: boolean) => {
    setOpen(v);
    if (v) setViewYear(currentYear);
  };

  return (
    <Popover open={open} onOpenChange={openChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "group flex items-center gap-1.5 rounded-lg px-2 py-1 -mx-2",
            "text-heading-2 md:text-display-4 capitalize truncate ml-1",
            "hover:bg-(--state-hover) transition-colors"
          )}
          aria-label="Выбрать месяц и год"
        >
          <span className="truncate">
            {format(anchor, "LLLL yyyy", { locale: ru })}
          </span>
          <CaretDown className="size-4 opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-64 p-3">
        {/* Year stepper */}
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => setViewYear((y) => y - 1)}
            aria-label="Предыдущий год"
            className="size-8 rounded-lg flex items-center justify-center text-(--on-bg-medium) hover:bg-(--state-hover) hover:text-(--on-bg-high) transition-colors"
          >
            ‹
          </button>
          <span className="text-heading-4 tabular-nums">{viewYear}</span>
          <button
            type="button"
            onClick={() => setViewYear((y) => y + 1)}
            aria-label="Следующий год"
            className="size-8 rounded-lg flex items-center justify-center text-(--on-bg-medium) hover:bg-(--state-hover) hover:text-(--on-bg-high) transition-colors"
          >
            ›
          </button>
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-3 gap-1">
          {MONTHS_SHORT.map((label, i) => {
            const isCurrent = viewYear === currentYear && i === currentMonth;
            return (
              <button
                key={label}
                type="button"
                onClick={() => pick(i)}
                className={cn(
                  "h-9 rounded-lg text-body-4 font-medium capitalize transition-colors",
                  isCurrent
                    ? "bg-(--primary) text-(--on-primary)"
                    : "text-(--on-bg-high) hover:bg-(--state-hover)"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
