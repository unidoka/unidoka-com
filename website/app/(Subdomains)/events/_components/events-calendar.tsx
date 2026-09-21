"use client";
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type DayButtonProps,
} from "react-day-picker";
import { ru } from "date-fns/locale";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface EventsCalendarProps {
  /** ISO dates of every day that has at least one event. */
  eventDates: Date[];
  selected: Date | undefined;
  onSelect: (d: Date | undefined) => void;
}

export function EventsCalendar({
  eventDates,
  selected,
  onSelect,
}: EventsCalendarProps) {
  const defaults = getDefaultClassNames();

  return (
    <DayPicker
      mode="single"
      selected={selected}
      onSelect={onSelect}
      locale={ru}
      weekStartsOn={1}
      showOutsideDays
      modifiers={{ hasEvent: eventDates }}
      classNames={{
        root: cn(
          defaults.root,
          "w-full max-w-sm p-4 rounded-3xl border border-(--outline) bg-(--card)"
        ),
        months: cn(defaults.months, "relative"),
        month: cn(defaults.month, "flex flex-col gap-3"),
        month_caption: cn(
          defaults.month_caption,
          "flex h-10 items-center justify-center text-heading-3 capitalize"
        ),
        nav: cn(
          defaults.nav,
          "absolute top-0 left-0 right-0 h-10 flex items-center justify-between px-1"
        ),
        button_previous: cn(
          defaults.button_previous,
          "size-8 rounded-full flex items-center justify-center text-(--on-bg-medium) hover:bg-(--state-hover) transition-colors"
        ),
        button_next: cn(
          defaults.button_next,
          "size-8 rounded-full flex items-center justify-center text-(--on-bg-medium) hover:bg-(--state-hover) transition-colors"
        ),
        weekdays: cn(defaults.weekdays, "grid grid-cols-7 gap-1"),
        weekday: cn(
          defaults.weekday,
          "h-9 flex items-center justify-center text-body-5 text-(--on-bg-low) font-medium uppercase"
        ),
        week: cn(defaults.week, "grid grid-cols-7 gap-1"),
        day: cn(defaults.day, "aspect-square"),
        outside: cn(defaults.outside, "opacity-30"),
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <CaretLeft className="size-4" />
          ) : (
            <CaretRight className="size-4" />
          ),
        DayButton: DayCell,
      }}
    />
  );
}

function DayCell({ day, modifiers, ...props }: DayButtonProps) {
  const hasEvent = modifiers.hasEvent;
  const isSelected = modifiers.selected;

  return (
    <button
      {...props}
      className={cn(
        "relative w-full h-full aspect-square rounded-2xl flex items-center justify-center text-body-3 transition-colors",
        isSelected
          ? "bg-(--primary) text-(--on-primary)"
          : modifiers.today
            ? "bg-(--state-hover) font-semibold"
            : "text-(--on-bg-high) hover:bg-(--state-hover)"
      )}
    >
      {day.date.getDate()}
      {hasEvent && (
        <span
          className={cn(
            "absolute bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full",
            isSelected ? "bg-(--on-primary)" : "bg-(--primary)"
          )}
        />
      )}
    </button>
  );
}
