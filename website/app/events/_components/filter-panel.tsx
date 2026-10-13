"use client";

import { Check, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
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
        <ToggleRow
          label="Только избранные"
          checked={value.featuredOnly}
          onToggle={(v) => onChange({ ...value, featuredOnly: v })}
        />
        <ToggleRow
          label="Только с открытой регистрацией"
          checked={value.hasRegistrationOnly}
          onToggle={(v) => onChange({ ...value, hasRegistrationOnly: v })}
        />
      </Section>
    </div>
  );
}

/**
 * Row-level binary filter toggle.
 *
 * Replaces the bare <Switch> that used to sit here. Reasons:
 *   1. The switch primitive's unchecked state relies on
 *      `data-unchecked:bg-input` -> --outline, and its thumb on
 *      --bg. In dark theme both resolve to near-black and the control
 *      becomes invisible — which is what the screenshot showed.
 *   2. A switch reads as a preference ("email me about events").
 *      A filter row that toggles whether a subset of events is shown
 *      is an action, and should look actionable.
 *   3. Making the whole row the hit target fixes the tap-size problem
 *      on mobile without adding any padding dance.
 *
 * State is signalled three ways so it can't be missed: background
 * fill, label color, and a checkmark inside a filled circle. Any one
 * of them reads on its own; together they're unambiguous.
 */
function ToggleRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onToggle(!checked)}
      className={cn(
        "group/toggle flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)/40",
        checked
          ? "border-(--primary) bg-(--primary-glass)"
          : "border-(--outline) bg-transparent hover:border-(--on-bg-low) hover:bg-(--state-hover)",
      )}
    >
      <span
        className={cn(
          "text-body-4 leading-tight transition-colors",
          checked
            ? "text-(--primary) font-medium"
            : "text-(--on-bg-high)",
        )}
      >
        {label}
      </span>
      {/* Indicator: hollow circle when off, filled circle with a
          checkmark when on. `shrink-0` keeps it square when the label
          wraps to two lines. */}
      <span
        aria-hidden
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
          checked
            ? "border-(--primary) bg-(--primary) text-(--on-primary)"
            : "border-(--on-bg-low) bg-transparent group-hover/toggle:border-(--on-bg-high)",
        )}
      >
        {checked && <Check className="size-3" weight="bold" />}
      </span>
    </button>
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
