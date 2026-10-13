"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

/**
 * OG / social-card preview.
 *
 * Renders the same title/description/image triple as the two layouts
 * this site's traffic actually sees: Telegram (large image card) and
 * a compact "link with thumbnail" row. Twitter/X and LinkedIn use the
 * same primitives as the Telegram variant with different skinning, so
 * two previews cover every destination without four near-identical
 * mockups.
 *
 * Character guidance is advisory: Telegram truncates ~70 chars of
 * title and ~180 chars of description, Twitter's summary_large_image
 * caps at 70 / 200. Recommendations here are the tighter of the two.
 */

const TITLE_SOFT = 60;
const TITLE_HARD = 70;
const DESC_SOFT = 160;
const DESC_HARD = 200;

export function SocialPreview() {
  const [title, setTitle] = useState("Хакатон «Вершины 2026» — регистрация открыта");
  const [description, setDescription] = useState(
    "Соревнования по разработке, дизайну и анализу данных. Призовой фонд, менторы и стажировки для участников.",
  );
  const [image, setImage] = useState("https://unidoka.com/og.jpg");
  const [host, setHost] = useState("unidoka.com");

  const titleTone =
    title.length > TITLE_HARD
      ? "over"
      : title.length > TITLE_SOFT
        ? "near"
        : "ok";
  const descTone =
    description.length > DESC_HARD
      ? "over"
      : description.length > DESC_SOFT
        ? "near"
        : "ok";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,420px)] gap-4">
      {/* Inputs */}
      <Card className="rounded-2xl border border-(--outline) bg-(--card) ring-0 p-5 space-y-4">
        <Field>
          <div className="flex items-center justify-between gap-3">
            <FieldLabel>Заголовок</FieldLabel>
            <Counter value={title.length} soft={TITLE_SOFT} hard={TITLE_HARD} />
          </div>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>

        <Field>
          <div className="flex items-center justify-between gap-3">
            <FieldLabel>Описание</FieldLabel>
            <Counter value={description.length} soft={DESC_SOFT} hard={DESC_HARD} />
          </div>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px]"
          />
        </Field>

        <Field>
          <FieldLabel>URL обложки</FieldLabel>
          <Input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="font-mono text-body-4"
            placeholder="https://…/og.jpg"
          />
          <p className="text-body-5 text-(--on-bg-low) mt-1">
            Рекомендуемый размер: 1200×630 px, JPG или PNG до 5 МБ
          </p>
        </Field>

        <Field>
          <FieldLabel>Домен для отображения</FieldLabel>
          <Input
            value={host}
            onChange={(e) => setHost(e.target.value)}
            className="font-mono text-body-4"
          />
        </Field>

        <div className="pt-3 border-t border-(--outline)">
          <p className="text-body-5 text-(--on-bg-low) leading-relaxed">
            Превью показывает как ссылка будет выглядеть при отправке в
            Telegram, VK и при кросспостинге в другие соцсети. Для проверки
            реальных метаданных страницы используйте{" "}
            <a
              href="https://www.opengraph.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-(--primary) underline underline-offset-2"
            >
              OpenGraph.xyz
            </a>{" "}
            после публикации.
          </p>
        </div>
      </Card>

      {/* Previews */}
      <div className="space-y-4">
        <div>
          <p className="text-body-5 uppercase tracking-[0.18em] text-(--on-bg-low) mb-2">
            Telegram
          </p>
          <Card className="rounded-2xl border border-(--outline) bg-(--card) ring-0 overflow-hidden">
            <div className="aspect-[1.91/1] bg-(--bg-disabled) relative">
              {image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.opacity = "0";
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-body-5 text-(--on-bg-low)">
                  Нет изображения
                </div>
              )}
            </div>
            <div className="p-3 border-l-[3px] border-(--primary)">
              <p className="text-body-3 font-semibold text-(--on-bg-high) mb-1 line-clamp-2">
                {title || "Заголовок"}
              </p>
              <p className="text-body-5 text-(--on-bg-medium) leading-snug line-clamp-2 mb-1">
                {description || "Описание"}
              </p>
              <p className="text-body-6 text-(--on-bg-low) font-mono">
                {host}
              </p>
            </div>
          </Card>
        </div>

        <div>
          <p className="text-body-5 uppercase tracking-[0.18em] text-(--on-bg-low) mb-2">
            Компактная ссылка
          </p>
          <Card className="rounded-2xl border border-(--outline) bg-(--card) ring-0 p-3">
            <div className="flex gap-3">
              <div className="size-16 shrink-0 rounded-lg overflow-hidden bg-(--bg-disabled) relative">
                {image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.opacity = "0";
                    }}
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-body-5 text-(--on-bg-low) font-mono mb-1 truncate">
                  {host}
                </p>
                <p className="text-body-3 font-medium text-(--on-bg-high) leading-snug line-clamp-2 mb-1">
                  {title || "Заголовок"}
                </p>
                <p className="text-body-5 text-(--on-bg-medium) leading-snug line-clamp-1">
                  {description || "Описание"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Counter({
  value,
  soft,
  hard,
}: {
  value: number;
  soft: number;
  hard: number;
}) {
  const tone = value > hard ? "over" : value > soft ? "near" : "ok";
  return (
    <span
      className={cn(
        "font-mono text-body-5 tabular-nums",
        tone === "ok" && "text-(--on-bg-low)",
        tone === "near" && "text-amber-500",
        tone === "over" && "text-destructive",
      )}
    >
      {value} / {soft}
    </span>
  );
}
