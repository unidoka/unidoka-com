"use client";
import { SOURCE_META } from "./source-meta";
import type { EventSource } from "../_data/events";
import { cn } from "@/lib/utils";

export type Filter = "all" | EventSource;

interface Props {
  value: Filter;
  onChange: (f: Filter) => void;
  counts: Record<Filter, number>;
  orientation?: "vertical" | "horizontal";
}

const ORDER: Filter[] = ["all", "rosmolodez", "roscongress"];

export function SourceFilter({
  value,
  onChange,
  counts,
  orientation = "vertical",
}: Props) {
  const items = ORDER.map((id) => ({
    id,
    label: id === "all" ? "Все события" : SOURCE_META[id].label,
    color: id === "all" ? null : SOURCE_META[id].color,
    count: counts[id] ?? 0,
  }));

  return (
    <div
      className={cn(
        "flex gap-1",
        orientation === "vertical" ? "flex-col" : "flex-row overflow-x-auto"
      )}
    >
      {items.map((it) => {
        const active = value === it.id;
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => onChange(it.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-body-4 font-medium transition-colors",
              orientation === "vertical" ? "w-full text-left" : "whitespace-nowrap",
              active
                ? "bg-(--primary-glass) text-(--primary)"
                : "text-(--on-bg-medium) hover:bg-(--state-hover) hover:text-(--on-bg-high)"
            )}
          >
            {it.color ? (
              <span
                className="size-2 rounded-full shrink-0"
                style={{ backgroundColor: it.color }}
              />
            ) : (
              <span className="size-2 rounded-full shrink-0 bg-(--on-bg-low)" />
            )}
            <span className="truncate">{it.label}</span>
            <span className="ml-auto text-[11px] tabular-nums text-(--on-bg-low)">
              {it.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
