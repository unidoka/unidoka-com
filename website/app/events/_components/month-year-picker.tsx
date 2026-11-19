"use client";

import { useState } from "react";
import { format, setMonth, setYear } from "date-fns";
import { enUS, ru } from "date-fns/locale";
import { CaretDown } from "@phosphor-icons/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

interface Props {
  anchor: Date;
  onSelect: (d: Date) => void;
}

const MONTHS_RU = [
  "янв", "фев", "мар", "апр", "май", "июн",
  "июл", "авг", "сен", "окт", "ноя", "дек",
];
const MONTHS_EN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function MonthYearPicker({ anchor, onSelect }: Props) {
  const { lang, t } = useLanguage();
  const dateLocale = lang === "en" ? enUS : ru;
  const months = lang === "en" ? MONTHS_EN : MONTHS_RU;
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
            // Reduced from display-4 to heading sizes for a more balanced look
            "text-heading-3 md:text-heading-2  tracking-tight capitalize truncate ml-1",
            "hover:bg-(--state-hover) transition-colors"
          )}
          aria-label={t("events.calendar.select_month_year")}
        >
          <span className="truncate">
            {format(anchor, "LLLL yyyy", { locale: dateLocale })}
          </span>
          <CaretDown className="size-4 opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-3">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => setViewYear((y) => y - 1)}
            aria-label={t("events.calendar.prev_year")}
            className="size-8 rounded-lg flex items-center justify-center text-(--on-bg-medium) hover:bg-(--state-hover) hover:text-(--on-bg-high) transition-colors"
          >
            ‹
          </button>
          <span className="text-body-3  tabular-nums">{viewYear}</span>
          <button
            type="button"
            onClick={() => setViewYear((y) => y + 1)}
            aria-label={t("events.calendar.next_year")}
            className="size-8 rounded-lg flex items-center justify-center text-(--on-bg-medium) hover:bg-(--state-hover) hover:text-(--on-bg-high) transition-colors"
          >
            ›
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {months.map((label, i) => {
            const isCurrent = viewYear === currentYear && i === currentMonth;
            return (
              <button
                key={label}
                type="button"
                onClick={() => pick(i)}
                className={cn(
                  "h-9 rounded-lg text-body-4  capitalize transition-colors",
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
