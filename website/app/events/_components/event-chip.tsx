"use client";

import { isSameDay } from "date-fns";
import { ArrowUpRight } from "@phosphor-icons/react";
import { colorForOrganizer } from "./organizer-meta";
import type { EventListItem } from "@/utils/api/events";
import { cn } from "@/lib/utils";

interface Props {
  event: EventListItem;
  day: Date;
  compact?: boolean;
  onClick?: (e: EventListItem) => void;
}

export function EventChip({ event, day, compact, onClick }: Props) {
  const color = colorForOrganizer(event.organizer);
  const start = event.start_at ? new Date(event.start_at) : null;
  const end = event.end_at ? new Date(event.end_at) : start;
  const startsToday = start ? isSameDay(start, day) : false;
  const endsToday = end ? isSameDay(end, day) : false;
  const leftFlush = !startsToday;
  const rightFlush = !endsToday;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(event);
      }}
      title={event.title}
      style={{ "--ev": color } as React.CSSProperties}
      className={cn(
        "group/chip w-full text-left transition-all duration-150",
        "border-l-[3px] border-[var(--ev)]",
        "bg-[color-mix(in_srgb,var(--ev)_12%,transparent)]",
        "hover:bg-[color-mix(in_srgb,var(--ev)_20%,transparent)]",
        "text-[var(--ev)] font-medium",
        compact
          ? "px-1.5 py-0.5 rounded text-[11px] leading-tight truncate"
          : "px-2 py-1 rounded-md text-[12px] leading-snug",
        leftFlush && "rounded-l-none border-l-0",
        rightFlush && "rounded-r-none",
      )}
    >
      <span className="flex items-center gap-1">
        {startsToday && (
          <span className="shrink-0 size-1.5 rounded-full bg-[var(--ev)]" />
        )}
        <span className="truncate">{event.title}</span>
        {!compact && startsToday && event.registration_url && (
          <ArrowUpRight className="ml-auto size-3 opacity-0 group-hover/chip:opacity-100 transition-opacity" />
        )}
      </span>
    </button>
  );
}
