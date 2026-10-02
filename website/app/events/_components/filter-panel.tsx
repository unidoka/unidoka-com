"use client";
import { Check, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  ALL_TYPES,
  TYPE_LABEL,
  type EventItem,
  type EventType,
} from "../_data/events";
import { colorForOrganizer } from "./organizer-meta";
import {
  DEFAULT_AGE_MAX,
  DEFAULT_AGE_MIN,
  EMPTY_FILTER,
  isFilterEmpty,
  uniqueCountries,
  uniqueOrganizers,
  type FilterState,
} from "./filters";
import { cn } from "@/lib/utils";

interface Props {
  allEvents: EventItem[];
  value: FilterState;
  onChange: (f: FilterState) => void;
  /** Rendered as a mobile sheet instead of sidebar. */
  compact?: boolean;
}

export function FilterPanel({ allEvents, value, onChange, compact }: Props) {
  const organizers = uniqueOrganizers(allEvents);
  const countries = uniqueCountries(allEvents);
  const empty = isFilterEmpty(value);

  const toggleOrganizer = (org: string) => {
    const has = value.organizers.includes(org);
    onChange({
      ...value,
      organizers: has
        ? value.organizers.filter((o) => o !== org)
        : [...value.organizers, org],
    });
  };

  const toggleType = (t: EventType) => {
    const has = value.types.includes(t);
    onChange({
      ...value,
      types: has ? value.types.filter((x) => x !== t) : [...value.types, t],
    });
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        compact ? "" : "rounded-2xl border border-(--outline) bg-(--card) p-4"
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

      {/* Организатор ------------------------------------------------- */}
      <Section title="Организатор">
        <div className="flex flex-col gap-0.5">
          {organizers.map((org) => {
            const active = value.organizers.includes(org);
            const count = allEvents.filter((e) => e.organizer === org).length;
            return (
              <button
                key={org}
                type="button"
                onClick={() => toggleOrganizer(org)}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-lg text-body-4 transition-colors",
                  active
                    ? "bg-(--primary-glass) text-(--primary)"
                    : "text-(--on-bg-medium) hover:bg-(--state-hover) hover:text-(--on-bg-high)"
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center size-4 rounded-[4px] border transition-colors shrink-0",
                    active
                      ? "bg-(--primary) border-(--primary) text-(--on-primary)"
                      : "border-(--outline)"
                  )}
                >
                  {active && <Check className="size-3" weight="bold" />}
                </span>
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: colorForOrganizer(org) }}
                />
                <span className="truncate">{org}</span>
                <span className="ml-auto text-[11px] tabular-nums text-(--on-bg-low)">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Тип -------------------------------------------------------- */}
      <Section title="Тип">
        <div className="flex flex-wrap gap-1.5">
          {ALL_TYPES.map((t) => {
            const active = value.types.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleType(t)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-body-5 font-medium transition-colors",
                  active
                    ? "bg-(--primary) text-(--on-primary)"
                    : "bg-(--state-hover) text-(--on-bg-medium) hover:text-(--on-bg-high)"
                )}
              >
                {TYPE_LABEL[t]}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Страна ----------------------------------------------------- */}
      <Section title="Страна">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onChange({ ...value, country: "" })}
            className={cn(
              "px-2.5 py-1 rounded-full text-body-5 font-medium transition-colors",
              value.country === ""
                ? "bg-(--primary) text-(--on-primary)"
                : "bg-(--state-hover) text-(--on-bg-medium) hover:text-(--on-bg-high)"
            )}
          >
            Все
          </button>
          {countries.map((c) => {
            const active = value.country === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => onChange({ ...value, country: c })}
                className={cn(
                  "px-2.5 py-1 rounded-full text-body-5 font-medium transition-colors",
                  active
                    ? "bg-(--primary) text-(--on-primary)"
                    : "bg-(--state-hover) text-(--on-bg-medium) hover:text-(--on-bg-high)"
                )}
              >
                {c}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Возраст ---------------------------------------------------- */}
      <Section title="Возраст">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            max={120}
            value={value.ageMin}
            onChange={(e) =>
              onChange({ ...value, ageMin: Number(e.target.value) || DEFAULT_AGE_MIN })
            }
            className="h-9 text-body-4"
            aria-label="Минимальный возраст"
          />
          <span className="text-(--on-bg-low) shrink-0">—</span>
          <Input
            type="number"
            min={0}
            max={120}
            value={value.ageMax}
            onChange={(e) =>
              onChange({ ...value, ageMax: Number(e.target.value) || DEFAULT_AGE_MAX })
            }
            className="h-9 text-body-4"
            aria-label="Максимальный возраст"
          />
        </div>
        <p className="text-body-5 text-(--on-bg-low) mt-2">
          Показать события, подходящие для этого возраста
        </p>
      </Section>

      {/* Регистрация ------------------------------------------------ */}
      <Section title="Регистрация">
        <label className="flex items-center justify-between gap-3 cursor-pointer">
          <span className="text-body-4 text-(--on-bg-high)">
            Только с открытой регистрацией
          </span>
          <Switch
            checked={value.registrationOpenOnly}
            onCheckedChange={(checked) =>
              onChange({ ...value, registrationOpenOnly: checked })
            }
          />
        </label>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-body-5 font-semibold text-(--on-bg-low) uppercase tracking-wider">
        {title}
      </h4>
      {children}
    </div>
  );
}
