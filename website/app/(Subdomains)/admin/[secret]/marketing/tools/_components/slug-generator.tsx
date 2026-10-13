"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

/**
 * Slug generator.
 *
 * Mirrors the transliteration rules the backend applies in
 * `app/api/v1/events.py::slugify` and `admin_events.py`, so a slug
 * typed here will land unchanged when the entity is saved. If the
 * backend map changes, update the TRANSLIT object below to match —
 * the two sides have to agree or user-generated slugs get suffixed
 * with `-2` on collision.
 */

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e",
  ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
  н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
  ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

function slugify(input: string): string {
  const lower = input.toLowerCase().trim();
  const transliterated = lower
    .split("")
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join("");
  return transliterated
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 180);
}

export function SlugGenerator() {
  const [title, setTitle] = useState("Хакатон Вершины 2026: весенний сезон");

  const slug = useMemo(() => slugify(title), [title]);
  const isClean = slug.length > 0 && slug.length <= 180;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,380px)] gap-4">
      <Card className="rounded-2xl border border-(--outline) bg-(--card) ring-0 p-5 space-y-4">
        <Field>
          <FieldLabel>Заголовок</FieldLabel>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название события, статьи или проекта"
          />
          <p className="text-body-5 text-(--on-bg-low) mt-1">
            Введите название на русском или английском — слаг будет
            транслитерирован по тем же правилам, что применяет бэкенд.
          </p>
        </Field>

        <div className="rounded-lg border border-(--outline) bg-(--bg) p-3">
          <p className="text-body-5 uppercase tracking-[0.14em] text-(--on-bg-low) mb-2">
            Правила
          </p>
          <ul className="text-body-5 text-(--on-bg-medium) space-y-1 leading-relaxed">
            <li>Кириллица → латиница по стандартной транслитерации</li>
            <li>Пробелы и подчёркивания → дефисы</li>
            <li>Повторяющиеся дефисы схлопываются</li>
            <li>Спецсимволы удаляются</li>
            <li>Максимум 180 символов</li>
          </ul>
        </div>
      </Card>

      <Card className="rounded-2xl border border-(--outline) bg-(--card) ring-0 p-5 flex flex-col gap-4 h-fit lg:sticky lg:top-32">
        <div>
          <p className="text-body-5 uppercase tracking-[0.18em] text-(--on-bg-low) mb-1">
            Результат
          </p>
          <p className="text-body-3 font-medium text-(--on-bg-high)">URL-слаг</p>
        </div>

        <div
          className={cn(
            "rounded-lg border p-3 min-h-[56px] flex items-center",
            slug && isClean
              ? "border-(--outline) bg-(--bg)"
              : "border-destructive/40 bg-destructive/5",
          )}
        >
          {slug ? (
            <p className="font-mono text-body-3 text-(--on-bg-high) break-all">
              /{slug}
            </p>
          ) : (
            <p className="font-mono text-body-4 text-(--on-bg-low)">
              Введите заголовок слева…
            </p>
          )}
        </div>

        {slug && (
          <div className="flex items-center gap-2">
            <CopyButton text={slug} />
            <span className="text-body-5 text-(--on-bg-low)">
              {slug.length} символов
            </span>
          </div>
        )}
      </Card>
    </div>
  );
}
