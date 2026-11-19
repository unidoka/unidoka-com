"use client";

import { Check, Hash, X } from "@phosphor-icons/react";
import type { EventListItem, EventsCategory } from "@/utils/api/events";
import {
  EMPTY_FILTER,
  isFilterEmpty,
  uniqueCities,
  uniqueTags,
  type FilterState,
} from "./filters";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

interface Props {
  allEvents: EventListItem[];
  value: FilterState;
  onChange: (f: FilterState) => void;
  compact?: boolean;
}

const CATEGORIES: { id: EventsCategory; key: string }[] = [
  { id: "activities", key: "events.calendar.activities" },
  { id: "competitions", key: "events.calendar.competitions" },
];

export function FilterPanel({ allEvents, value, onChange, compact }: Props) {
  const { t } = useLanguage();
  const tags = uniqueTags(allEvents);
  const cities = uniqueCities(allEvents);
  const empty = isFilterEmpty(value);

  const toggleCategory = (category: EventsCategory) => {
    const has = value.categories.includes(category);
    onChange({
      ...value,
      categories: has
        ? value.categories.filter((x) => x !== category)
        : [...value.categories, category],
    });
  };

  const toggleCity = (city: string) => {
    const has = value.cities.includes(city);
    onChange({
      ...value,
      cities: has
        ? value.cities.filter((x) => x !== city)
        : [...value.cities, city],
    });
  };

  const toggleTag = (id: string) => {
    const has = value.tagIds.includes(id);
    onChange({
      ...value,
      tagIds: has ? value.tagIds.filter((x) => x !== id) : [...value.tagIds, id],
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
        <h3 className="text-body-5  uppercase tracking-widest text-(--on-bg-low)">
          {t("events.calendar.filters")}
        </h3>
        {!empty && (
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTER)}
            className="inline-flex items-center gap-1 text-body-5 text-(--primary) hover:underline"
          >
            <X className="size-3" /> {t("events.calendar.reset")}
          </button>
        )}
      </div>

      <Section title={t("events.calendar.categories")}>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            active={value.categories.length === 0}
            onClick={() => onChange({ ...value, categories: [] })}
          >
            {t("events.calendar.all")}
          </FilterChip>
          {CATEGORIES.map((category) => (
            <FilterChip
              key={category.id}
              active={value.categories.includes(category.id)}
              onClick={() => toggleCategory(category.id)}
            >
              {t(category.key)}
            </FilterChip>
          ))}
        </div>
      </Section>

      {cities.length > 0 && (
        <Section title={t("events.calendar.cities")}>
          <div className="flex max-h-44 flex-wrap gap-1.5 overflow-y-auto pr-1">
            <FilterChip
              active={value.cities.length === 0}
              onClick={() => onChange({ ...value, cities: [] })}
            >
              {t("events.calendar.all")}
            </FilterChip>
            {cities.map((city) => (
              <FilterChip
                key={city.name}
                active={value.cities.includes(city.name)}
                onClick={() => toggleCity(city.name)}
              >
                {city.name}
                <span className="text-[10px] tabular-nums opacity-60">
                  {city.count}
                </span>
              </FilterChip>
            ))}
          </div>
        </Section>
      )}

      {tags.length > 0 && (
        <Section title={t("events.calendar.tags")}>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => {
              const active = value.tagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-body-5  transition-colors",
                    active
                      ? "bg-(--primary) text-(--on-primary)"
                      : "bg-(--state-hover) text-(--on-bg-medium) hover:text-(--on-bg-high)",
                  )}
                >
                  <Hash className="size-3 opacity-70" />
                  {tag.name}
                  <span className="text-[10px] tabular-nums opacity-60">{tag.count}</span>
                </button>
              );
            })}
          </div>
        </Section>
      )}

      <Section title={t("events.calendar.show")}>
        <ToggleRow
          label={t("events.calendar.registration_only")}
          checked={value.hasRegistrationOnly}
          onToggle={(v) => onChange({ ...value, hasRegistrationOnly: v })}
        />
      </Section>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-body-5  transition-colors",
        active
          ? "bg-(--primary) text-(--on-primary)"
          : "bg-(--state-hover) text-(--on-bg-medium) hover:text-(--on-bg-high)",
      )}
    >
      {children}
    </button>
  );
}

/**
 * Row-level binary filter toggle.
 *
 * Replaces the bare <Switch> that used to sit here. Reasons:
 *   1. The switch primitive's unchecked state relies on
 *      `data-unchecked:bg-input` -> --outline, and its thumb on
 *      --bg. In dark theme both resolve to near-black and the control
 *      becomes invisible - which is what the screenshot showed.
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
            ? "text-(--primary) "
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
      <h4 className="text-body-5  text-(--on-bg-low) uppercase tracking-wider">
        {title}
      </h4>
      {children}
    </div>
  );
}
