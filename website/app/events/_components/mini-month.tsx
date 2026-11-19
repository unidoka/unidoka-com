"use client";

import { addMonths, format, isSameDay, isSameMonth, isToday, subMonths } from "date-fns";
import { enUS, ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { monthGrid } from "./date-utils";
import { cn } from "@/lib/utils";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useLanguage } from "@/providers/language-provider";

interface Props {
  month: Date;
  selected: Date;
  eventDays: Set<string>;
  onMonthChange: (d: Date) => void;
  onSelect: (d: Date) => void;
}

const WEEKDAYS_RU = ["П", "В", "С", "Ч", "П", "С", "В"];
const WEEKDAYS_EN = ["M", "T", "W", "T", "F", "S", "S"];

export function MiniMonth({ month, selected, eventDays, onMonthChange, onSelect }: Props) {
  const { lang } = useLanguage();
  const dateLocale = lang === "en" ? enUS : ru;
  const weekdays = lang === "en" ? WEEKDAYS_EN : WEEKDAYS_RU;
  const cells = monthGrid(month);

  return (
    <div className="rounded-xl border border-(--outline) bg-(--card) p-3 w-full max-w-[280px]">
      <div className="flex items-center justify-between mb-3 px-1">
        <button
          type="button"
          onClick={() => onMonthChange(subMonths(month, 1))}
          className="size-7 flex items-center justify-center rounded-md hover:bg-(--state-hover) text-(--on-bg-medium) transition-colors"
        >
          <CaretLeft className="size-3.5" />
        </button>
        <div className="text-body-4  capitalize text-(--on-bg-high)">
          {format(month, "LLLL yyyy", { locale: dateLocale })}
        </div>
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, 1))}
          className="size-7 flex items-center justify-center rounded-md hover:bg-(--state-hover) text-(--on-bg-medium) transition-colors"
        >
          <CaretRight className="size-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {weekdays.map((d, i) => (
          <div
            key={i}
            className="h-7 flex items-center justify-center text-[10px]  text-(--on-bg-low) uppercase"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d) => {
          const key = format(d, "yyyy-MM-dd");
          const inMonth = isSameMonth(d, month);
          const isSel = isSameDay(d, selected);
          const today = isToday(d);
          const hasEvent = eventDays.has(key);

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(d)}
              className={cn(
                "relative aspect-square rounded-full flex items-center justify-center text-[12px]  transition-colors",
                !inMonth && "text-(--on-bg-low) opacity-40",
                inMonth && !isSel && "text-(--on-bg-high) hover:bg-(--state-hover)",
                isSel && "bg-(--on-bg-high) text-(--bg)", // Inverted selected state
                today && !isSel && "text-(--primary) "
              )}
            >
              {d.getDate()}
              {hasEvent && (
                <span
                  className={cn(
                    "absolute bottom-0.5 left-1/2 -translate-x-1/2 size-1 rounded-full",
                    isSel ? "bg-(--bg)" : "bg-(--on-bg-low)"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
