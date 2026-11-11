"use client";

import { isSameDay, format } from "date-fns";
import { colorForOrganizer } from "./organizer-meta";
import type { EventListItem } from "@/utils/api/events";
import { cn } from "@/lib/utils";

interface Props {
  event: EventListItem;
  day: Date;
  compact?: boolean;
  onClick?: (e: EventListItem) => void;
}

const stripHtml = (str: string) => str.replace(/<[^>]*>?/gm, '');

export function EventChip({ event, day, compact, onClick }: Props) {
  const color = colorForOrganizer(event.organizer);
  const start = event.start_at ? new Date(event.start_at) : null;
  const startsToday = start ? isSameDay(start, day) : false;
  const timeString = start ? format(start, "HH:mm") : "";

  if (compact) {
    // Compact mode for Month View (single line, tight)
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(event);
        }}
        title={stripHtml(event.title)}
        style={{ "--ev": color } as React.CSSProperties}
        className="group/chip w-full text-left transition-all duration-150 flex flex-col gap-0.5 w-full overflow-hidden p-1.5 rounded-md hover:bg-(--state-hover) border-l-2 border-[var(--ev)] bg-[color-mix(in_srgb,var(--ev)_8%,transparent)]"
      >
        <span className="truncate font-medium text-[11px] leading-tight text-(--on-bg-high)">
          {stripHtml(event.title)}
        </span>
      </button>
    );
  }

  // Block mode for Week View (stacked time + title, multi-line)
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
        "group/chip w-full text-left transition-all duration-150 flex flex-col gap-1 p-2 rounded-md border border-(--outline) bg-(--card) hover:border-[var(--ev)] overflow-hidden",
        startsToday && "border-l-[3px] border-l-[var(--ev)]"
      )}
    >
      <div className="flex items-center gap-1.5 w-full min-w-0">
        <span className="shrink-0 size-1.5 rounded-full bg-[var(--ev)]" />
        {timeString && (
          <span className="shrink-0 text-[10px] tabular-nums tracking-wider font-semibold text-(--on-bg-medium)">
            {timeString}
          </span>
        )}
      </div>
      <span className="text-[11px] font-medium leading-snug text-(--on-bg-high) line-clamp-2 break-words">
        {stripHtml(event.title)}
      </span>
    </button>
  );
}
