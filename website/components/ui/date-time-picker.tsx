"use client";

import * as React from "react";
import { format, isValid } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import { CalendarBlankIcon, XIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLanguage } from "@/providers/language-provider";

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  clearable?: boolean;
}

function localToDate(value: string): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return isValid(d) ? d : undefined;
}

function dateToLocal(d: Date, hh: number, mm: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    hh,
  )}:${pad(mm)}`;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder,
  disabled,
  className,
  clearable = true,
}: DateTimePickerProps) {
  const { lang } = useLanguage();
  const locale = lang === "ru" ? ru : enUS;
  const [open, setOpen] = React.useState(false);

  const date = localToDate(value);
  const [time, setTime] = React.useState("12:00");

  React.useEffect(() => {
    const d = localToDate(value);
    if (d) {
      setTime(
        `${String(d.getHours()).padStart(2, "0")}:${String(
          d.getMinutes(),
        ).padStart(2, "0")}`,
      );
    }
  }, [value]);

  const commit = (nextDate: Date | undefined, nextTime: string) => {
    if (!nextDate) {
      onChange("");
      return;
    }
    const [hh, mm] = nextTime.split(":").map((s) => parseInt(s, 10) || 0);
    onChange(dateToLocal(nextDate, hh, mm));
  };

  const handleDateSelect = (d: Date | undefined) => commit(d, time);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setTime("12:00");
  };

  const hours24 = time.split(":")[0] || "12";
  const minutes24 = time.split(":")[1] || "00";
  const hours12 = ((parseInt(hours24, 10) + 11) % 12) + 1;
  const isPM = parseInt(hours24, 10) >= 12;
  const ampm = isPM ? "PM" : "AM";

  const updateTime = (h: string, m: string, p: string) => {
    let hh = parseInt(h, 10) || 0;
    if (p === "PM" && hh < 12) hh += 12;
    if (p === "AM" && hh === 12) hh = 0;
    const next = `${String(hh).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    setTime(next);
    commit(localToDate(value) ?? new Date(), next);
  };

  const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center gap-2 rounded-lg border border-(--outline-strong) bg-(--bg) px-2.5 py-1 text-left text-base transition-colors md:text-sm",
            "hover:border-(--on-bg-low)",
            "focus-visible:border-(--on-bg-high) focus-visible:outline-none",
            "disabled:pointer-events-none disabled:opacity-50",
            !date && "text-(--on-bg-low)",
            className,
          )}
        >
          <CalendarBlankIcon className="size-4 shrink-0 text-(--on-bg-low)" />
          <span className="flex-1 truncate">
            {date
              ? format(date, "d MMM yyyy, HH:mm", { locale })
              : placeholder ?? "Выберите дату и время"}
          </span>
          {clearable && date && (
            <span
              role="button"
              tabIndex={-1}
              onClick={handleClear}
              aria-label="Очистить"
              className="flex size-5 shrink-0 items-center justify-center rounded-md text-(--on-bg-low) hover:bg-(--state-hover) hover:text-(--on-bg-high)"
            >
              <XIcon className="size-3.5" />
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        collisionPadding={12}
        /* Match trigger width but never go below 320px - the calendar
           needs at least that to lay out 7 columns comfortably. On a
           narrow trigger (260px in "other dates" rows) it grows to
           the minimum and Radix slides it inside the viewport. */
        className="p-0 border-(--outline) bg-(--card) shadow-2xl w-[max(var(--radix-popover-trigger-width),320px)]"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          locale={locale}
          autoFocus
          defaultMonth={date ?? new Date()}
          className="w-full p-3 [--cell-size:--spacing(9)]"
        />

        {/* Time picker - segmented hour / minute / AM-PM. Three fixed
            columns so the fields align with the calendar above and the
            whole strip fills the popover width. */}
        <div className="border-t border-(--outline) px-3 py-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-(--on-bg-low) mb-2">
            Время
          </p>
          <div className="grid grid-cols-[1fr_1fr_1fr] gap-2">
            <TimeColumn
              value={String(hours12).padStart(2, "0")}
              options={HOURS}
              onChange={(h) => updateTime(h, minutes24, ampm)}
            />
            <TimeColumn
              value={minutes24}
              options={MINUTES}
              onChange={(m) => updateTime(String(hours12).padStart(2, "0"), m, ampm)}
            />
            <TimeColumn
              value={ampm}
              options={["AM", "PM"]}
              onChange={(p) =>
                updateTime(String(hours12).padStart(2, "0"), minutes24, p)
              }
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* An iOS-style wheel: the value in the centre is large and solid, the
   neighbours are small and dimmed. Scrolling moves the highlight, and
   the value is committed once the wheel settles. */
const WHEEL_ITEM_H = 36;
const WHEEL_PAD = WHEEL_ITEM_H * 2;

function TimeColumn({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const settle = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [center, setCenter] = React.useState(() =>
    Math.max(0, options.indexOf(value)),
  );

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const index = Math.max(0, options.indexOf(value));
    el.scrollTo({ top: index * WHEEL_ITEM_H, behavior: "auto" });
    setCenter(index);
  }, [value, options]);

  React.useEffect(
    () => () => {
      if (settle.current) clearTimeout(settle.current);
    },
    [],
  );

  const handleScroll = () => {
    const el = ref.current;
    if (!el) return;
    const index = Math.max(
      0,
      Math.min(
        options.length - 1,
        Math.round(el.scrollTop / WHEEL_ITEM_H),
      ),
    );
    setCenter(index);
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      const next = options[index];
      if (next && next !== value) onChange(next);
    }, 140);
  };

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      role="listbox"
      className="h-[180px] snap-y snap-mandatory overflow-y-auto rounded-lg border border-(--outline) bg-(--bg) [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div style={{ height: WHEEL_PAD }} aria-hidden />
      {options.map((opt, index) => {
        const isCenter = index === center;
        return (
          <button
            key={opt}
            type="button"
            role="option"
            aria-selected={isCenter}
            onClick={() => {
              onChange(opt);
              ref.current?.scrollTo({
                top: index * WHEEL_ITEM_H,
                behavior: "smooth",
              });
            }}
            style={{ height: WHEEL_ITEM_H }}
            className={cn(
              "flex w-full snap-center items-center justify-center font-mono tabular-nums transition-colors",
              isCenter
                ? "text-body-2 text-(--on-bg-high)"
                : "text-body-5 text-(--on-bg-low) hover:text-(--on-bg-medium)",
            )}
          >
            {opt}
          </button>
        );
      })}
      <div style={{ height: WHEEL_PAD }} aria-hidden />
    </div>
  );
}
