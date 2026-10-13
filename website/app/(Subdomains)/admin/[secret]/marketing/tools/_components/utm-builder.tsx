"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { CopyButton } from "@/components/ui/copy-button";
import { ArrowClockwiseIcon } from "@phosphor-icons/react";

/**
 * UTM parameter builder.
 *
 * Builds a tracked URL from a base and five standard UTM fields. The
 * output updates live — every input is derived from a single useMemo,
 * so there's no "build" step to forget.
 *
 * Presets cover the four sources this site actually uses in practice.
 * Clicking one fills source + medium and leaves campaign for the user —
 * campaign names are campaign-specific and can't be guessed.
 */

interface UtmState {
  baseUrl: string;
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
}

const EMPTY: UtmState = {
  baseUrl: "https://unidoka.com/",
  source: "",
  medium: "",
  campaign: "",
  term: "",
  content: "",
};

const PRESETS: { label: string; source: string; medium: string }[] = [
  { label: "Telegram", source: "telegram", medium: "social" },
  { label: "VK", source: "vk", medium: "social" },
  { label: "Email", source: "email", medium: "email" },
  { label: "QR / Print", source: "qr", medium: "print" },
];

export function UtmBuilder() {
  const [state, setState] = useState<UtmState>(EMPTY);

  const set = <K extends keyof UtmState>(key: K, value: UtmState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  const applyPreset = (source: string, medium: string) =>
    setState((prev) => ({ ...prev, source, medium }));

  const reset = () => setState(EMPTY);

  // Build the final URL. We only append parameters that have a value —
  // blank UTM fields produce noise in analytics and are easy to
  // misread as "the campaign had no source".
  const output = useMemo(() => {
    const base = state.baseUrl.trim();
    if (!base) return "";
    let url: URL;
    try {
      url = new URL(base);
    } catch {
      return "";
    }
    const params: [string, string][] = [
      ["utm_source", state.source.trim()],
      ["utm_medium", state.medium.trim()],
      ["utm_campaign", state.campaign.trim()],
      ["utm_term", state.term.trim()],
      ["utm_content", state.content.trim()],
    ];
    for (const [key, value] of params) {
      if (value) url.searchParams.set(key, value);
    }
    return url.toString();
  }, [state]);

  const isValid = output.length > 0;
  const hasAnyUtm = Boolean(
    state.source.trim() ||
      state.medium.trim() ||
      state.campaign.trim() ||
      state.term.trim() ||
      state.content.trim(),
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,380px)] gap-4">
      {/* Inputs */}
      <Card className="rounded-2xl border border-(--outline) bg-(--card) ring-0 p-5 space-y-4">
        <Field>
          <FieldLabel>Базовая ссылка</FieldLabel>
          <Input
            value={state.baseUrl}
            onChange={(e) => set("baseUrl", e.target.value)}
            placeholder="https://unidoka.com/events"
            className="font-mono text-body-4"
          />
          {!isValid && state.baseUrl.trim() && (
            <p className="text-body-5 text-destructive mt-1">
              Некорректный URL
            </p>
          )}
        </Field>

        <div>
          <p className="text-body-5 uppercase tracking-[0.14em] text-(--on-bg-low) mb-2">
            Быстрые пресеты
          </p>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => {
              const active =
                state.source === p.source && state.medium === p.medium;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p.source, p.medium)}
                  className={
                    "rounded-full px-3 py-1.5 text-body-4 font-medium transition-colors " +
                    (active
                      ? "bg-(--primary) text-(--on-primary)"
                      : "bg-(--card) border border-(--outline) text-(--on-bg-medium) hover:text-(--on-bg-high)")
                  }
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field>
            <FieldLabel>utm_source</FieldLabel>
            <Input
              value={state.source}
              onChange={(e) => set("source", e.target.value)}
              placeholder="telegram"
              className="font-mono text-body-4"
            />
          </Field>
          <Field>
            <FieldLabel>utm_medium</FieldLabel>
            <Input
              value={state.medium}
              onChange={(e) => set("medium", e.target.value)}
              placeholder="social"
              className="font-mono text-body-4"
            />
          </Field>
          <Field className="sm:col-span-2">
            <FieldLabel>utm_campaign</FieldLabel>
            <Input
              value={state.campaign}
              onChange={(e) => set("campaign", e.target.value)}
              placeholder="spring_hackathon_2026"
              className="font-mono text-body-4"
            />
          </Field>
          <Field>
            <FieldLabel>utm_term (опц.)</FieldLabel>
            <Input
              value={state.term}
              onChange={(e) => set("term", e.target.value)}
              placeholder="registration"
              className="font-mono text-body-4"
            />
          </Field>
          <Field>
            <FieldLabel>utm_content (опц.)</FieldLabel>
            <Input
              value={state.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder="cta_button"
              className="font-mono text-body-4"
            />
          </Field>
        </div>

        <div className="flex justify-end pt-2 border-t border-(--outline)">
          <Button variant="text" size="small" onClick={reset}>
            <ArrowClockwiseIcon className="size-4" />
            Сбросить
          </Button>
        </div>
      </Card>

      {/* Output */}
      <Card className="rounded-2xl border border-(--outline) bg-(--card) ring-0 p-5 flex flex-col gap-4 h-fit lg:sticky lg:top-32">
        <div>
          <p className="text-body-5 uppercase tracking-[0.18em] text-(--on-bg-low) mb-1">
            Результат
          </p>
          <p className="text-body-3 font-medium text-(--on-bg-high)">
            Отслеживаемая ссылка
          </p>
        </div>

        <div className="rounded-lg border border-(--outline) bg-(--bg) p-3 min-h-[96px]">
          {isValid ? (
            <p className="font-mono text-body-4 text-(--on-bg-high) break-all leading-relaxed">
              {output}
            </p>
          ) : (
            <p className="font-mono text-body-4 text-(--on-bg-low)">
              Введите корректный URL слева…
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <CopyButton text={isValid ? output : ""} />
          <span className="text-body-5 text-(--on-bg-low)">
            {hasAnyUtm ? "Готово к вставке" : "Добавьте UTM-параметры"}
          </span>
        </div>

        <div className="pt-3 border-t border-(--outline) space-y-2">
          <p className="text-body-5 text-(--on-bg-low) leading-relaxed">
            Соглашение о названиях:
          </p>
          <ul className="text-body-5 text-(--on-bg-medium) space-y-1 leading-relaxed">
            <li>
              <span className="font-mono text-(--on-bg-high)">source</span> —
              площадка: telegram, vk, email, qr
            </li>
            <li>
              <span className="font-mono text-(--on-bg-high)">medium</span> —
              тип: social, email, print, cpc
            </li>
            <li>
              <span className="font-mono text-(--on-bg-high)">campaign</span> —
              snake_case, с годом: spring_2026
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
