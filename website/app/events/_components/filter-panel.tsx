"use client";

import { Check, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { EventListItem } from "@/utils/api/events";
import { colorForOrganizer } from "./organizer-meta";
import {
  EMPTY_FILTER,
  isFilterEmpty,
  uniqueOrganizers,
  uniqueTypes,
  type FilterState,
} from "./filters";
import { cn } from "@/lib/utils";

interface Props {
  allEvents: EventListItem[];
  value: FilterState;
  onChange: (f: FilterState) => void;
  compact?: boolean;
}

export function FilterPanel({ allEvents, value, onChange, compact }: Props) {
  const organizers = uniqueOrganizers(allEvents);
  const types = uniqueTypes(allEvents);
  const empty = isFilterEmpty(value);

  const toggleOrganizer = (id: string) => {
    const has = value.organizerIds.includes(id);
    onChange({
      ...value,
      organizerIds: has
        ? value.organizerIds.filter((x) => x !== id)
        : [...value.organizerIds, id],
    });
  };

  const toggleType = (id: string) => {
    const has = value.typeIds.includes(id);
    onChange({
      ...value,
      typeIds: has ? value.typeIds.filter((x) => x !== id) : [...value.typeIds, id],
    });
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        compact ? "" : "rounded-2xl border border-(--outline) bg-(--card) p-4",
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-body-5 font-semibold uppercase tracking-widest text-(--on-bg-low)">
          Фильтры
        </h3>
        {!empty && (
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTER)}
            className="inline-flex items-center gap-1 text-body-5 text-(--primary) hover:underline"
          >
            <X className="size-3" /> Сбросить
          </button>
        )}
      </div>

      {organizers.length > 0 && (
        <Section title="Организатор">
          <div className="flex flex-col gap-0.5">
            {organizers.map((org) => {
              const active = value.organizerIds.includes(org.id);
              const color = colorForOrganizer(org);
              return (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => toggleOrganizer(org.id)}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-lg text-body-4 transition-colors",
                    active
                      ? "bg-(--primary-glass) text-(--primary)"
                      : "text-(--on-bg-medium) hover:bg-(--state-hover) hover:text-(--on-bg-high)",
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center justify-center size-4 rounded-[4px] border transition-colors shrink-0",
                      active
                        ? "bg-(--primary) border-(--primary) text-(--on-primary)"
                        : "border-(--outline)",
                    )}
                  >
                    {active && <Check className="size-3" weight="bold" />}
                  </span>
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="truncate">{org.name}</span>
                  <span className="ml-auto text-[11px] tabular-nums text-(--on-bg-low)">
                    {org.count}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {types.length > 0 && (
        <Section title="Тип">
          <div className="flex flex-wrap gap-1.5">
            {types.map((t) => {
              const active = value.typeIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleType(t.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-body-5 font-medium transition-colors",
                    active
                      ? "bg-(--primary) text-(--on-primary)"
                      : "bg-(--state-hover) text-(--on-bg-medium) hover:text-(--on-bg-high)",
                  )}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      <Section title="Показывать">
        <label className="flex items-center justify-between gap-3 cursor-pointer">
          <span className="text-body-4 text-(--on-bg-high)">Только избранные</span>
          <Switch
            checked={value.featuredOnly}
            onCheckedChange={(v) => onChange({ ...value, featuredOnly: v })}
          />
        </label>
        <label className="flex items-center justify-between gap-3 cursor-pointer">
          <span className="text-body-4 text-(--on-bg-high)">
            Только с открытой регистрацией
          </span>
          <Switch
            checked={value.hasRegistrationOnly}
            onCheckedChange={(v) => onChange({ ...value, hasRegistrationOnly: v })}
          />
        </label>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-body-5 font-semibold text-(--on-bg-low) uppercase tracking-wider">
        {title}
      </h4>
      {children}
    </div>
  );
}
