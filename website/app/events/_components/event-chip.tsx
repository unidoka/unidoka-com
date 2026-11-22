"use client";

import { isSameDay, format } from "date-fns";
import { parseEventDate } from "./date-utils";
import { colorForOrganizer } from "./organizer-meta";
import type { EventListItem } from "@/utils/api/events";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

interface Props {
  event: EventListItem;
  day: Date;
  compact?: boolean;
  onClick?: (e: EventListItem) => void;
}

const stripHtml = (str: string) => str.replace(/<[^>]*>?/gm, '');

export function EventChip({ event, day, compact, onClick }: Props) {
  const { t } = useLanguage();
  const color = colorForOrganizer(event.organizer);
  const start = parseEventDate(event.start_at);
  const startsToday = start ? isSameDay(start, day) : false;
  const timeString = event.is_all_day
    ? t("events.calendar.all_day")
    : start
      ? format(start, "HH:mm")
      : "";

  if (compact) {
    // Month view: soft tinted pill with a colour dot, no hard border.
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(event);
        }}
        title={stripHtml(event.title)}
        style={{ "--ev": color } as React.CSSProperties}
        className="group/chip flex w-full min-w-0 items-center gap-1.5 overflow-hidden rounded-lg bg-[color-mix(in_srgb,var(--ev)_7%,transparent)] px-2 py-1 text-left transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--ev)_13%,transparent)]"
      >
        <span className="size-1.5 shrink-0 rounded-full bg-[var(--ev)]" />
        <span className="truncate text-[11px] leading-tight text-(--on-bg-high)">
          {stripHtml(event.title)}
        </span>
      </button>
    );
  }

  // Week view: card with a soft left accent and a lift on hover.
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(event);
      }}
      title={stripHtml(event.title)}
      style={{ "--ev": color } as React.CSSProperties}
      className={cn(
        "group/chip relative flex w-full flex-col gap-1.5 overflow-hidden rounded-xl border border-(--outline) bg-(--card) p-2.5 pl-3 text-left transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ev)_45%,var(--outline))] hover:shadow-[0_10px_26px_-16px_color-mix(in_srgb,var(--ev)_45%,transparent)]",
        startsToday && "border-[color-mix(in_srgb,var(--ev)_32%,var(--outline))]",
      )}
    >
      <div className="flex items-center gap-1.5 w-full min-w-0">
        <span className="shrink-0 size-1.5 rounded-full bg-[var(--ev)] opacity-70" />
        {timeString && (
          <span className="shrink-0 text-[10px] tabular-nums tracking-wider  text-(--on-bg-medium)">
            {timeString}
          </span>
        )}
      </div>
      <span className="text-[11px]  leading-snug text-(--on-bg-high) line-clamp-2 break-words">
        {stripHtml(event.title)}
      </span>
    </button>
  );
}
