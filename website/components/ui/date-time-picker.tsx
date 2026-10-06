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

  const handleTimeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = e.target.value || "00:00";
    setTime(t);
    commit(localToDate(value) ?? new Date(), t);
  };

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
        /* Match trigger width but never go below 320px — the calendar
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

        {/* Time picker — segmented hour / minute / AM-PM. Three fixed
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

/* A scrollable column of values. Values in a fixed-height container
   with `scroll-snap` so paging feels deliberate, and the active value
   snaps into place at the top when the popover opens. */
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

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const active = el.querySelector<HTMLElement>("[data-active='true']");
    if (active) active.scrollIntoView({ block: "center", behavior: "instant" });
  }, [value]);

  return (
    <div
      ref={ref}
      className="h-[168px] overflow-y-auto scrollbar-terminal rounded-lg border border-(--outline) bg-(--bg) py-1"
    >
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            data-active={active}
            onClick={() => onChange(opt)}
            className={cn(
              "w-full h-8 text-center font-mono text-body-4 tabular-nums transition-colors rounded-md mx-1",
              active
                ? "bg-(--on-bg-high) text-(--bg) font-semibold"
                : "text-(--on-bg-medium) hover:bg-(--state-hover) hover:text-(--on-bg-high)",
            )}
            style={{ width: "calc(100% - 8px)" }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
