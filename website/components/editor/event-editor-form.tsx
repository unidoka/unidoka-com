"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CircleNotchIcon,
  PlusIcon,
  TrashIcon,
  CalendarBlankIcon,
  CalendarCheckIcon,
  ArrowUpRightIcon,
  MapPinIcon,
} from "@phosphor-icons/react";
import {
  createEvent,
  updateEvent,
  type EventDetail,
  type EventPayload,
  type OtherDateInput,
} from "@/utils/api/events";
import {
  fetchOrganizersPublic,
  fetchEventTypesPublic,
  fetchDirectionsPublic,
  type Organizer,
  type EventTypeTaxonomy,
  type Direction,
} from "@/utils/api/event-taxonomies";
import { ImageUploadField } from "./image-upload-field";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { MdxEditor } from "./mdx-editor";
import { colorForOrganizer } from "@/app/events/_components/organizer-meta";

interface Props {
  editing: EventDetail | null;
  mode: "admin" | "user";
  redirectAfter?: string;
}

const NO_ORGANIZER = "__none__";
const OTHER_ORGANIZER = "__other__";

export function EventEditorForm({ editing, mode, redirectAfter }: Props) {
  const router = useRouter();

  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [types, setTypes] = useState<EventTypeTaxonomy[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [metaError, setMetaError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    short_description: "",
    description: "",
    mdx_content: "",
    cover_image_src: "",
    href: "",
    start_at: "",
    end_at: "",
    registration_deadline: "",
    location_name: "",
    address: "",
    price: "",
    capacity: "",
    registration_url: "",
    organizer_id: NO_ORGANIZER,
    custom_organizer_name: "",
    subdirection_ids: [] as string[],
    is_featured: false,
    seo_title: "",
    meta_description: "",
    status: "approved" as "pending" | "approved" | "rejected",
  });
  const [otherDates, setOtherDates] = useState<OtherDateInput[]>([]);
  const [typeSelections, setTypeSelections] = useState<
    Array<{ id: string; isCustom: boolean; customName: string }>
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* ── Load taxonomy ───────────────────────────────────────────────── */
  useEffect(() => {
    Promise.all([
      fetchOrganizersPublic(),
      fetchEventTypesPublic(),
      fetchDirectionsPublic(),
    ])
      .then(([o, t, d]) => {
        setOrganizers(o);
        setTypes(t);
        setDirections(d.filter((x) => (x.subdirections ?? []).length > 0));
      })
      .catch((err) =>
        setMetaError(err?.message || "Не удалось загрузить справочники"),
      );
  }, []);

  /* ── Hydrate when editing ────────────────────────────────────────── */
  useEffect(() => {
    if (!editing) return;
    setForm({
      title: editing.title,
      short_description: editing.short_description ?? "",
      description: editing.description ?? "",
      mdx_content: editing.mdx_content ?? "",
      cover_image_src: editing.cover_image_src ?? "",
      href: editing.href ?? "",
      start_at: toLocalInput(editing.start_at),
      end_at: toLocalInput(editing.end_at),
      registration_deadline: toLocalInput(editing.registration_deadline),
      location_name: editing.location_name ?? "",
      address: editing.address ?? "",
      price: editing.price ?? "",
      capacity: editing.capacity ? String(editing.capacity) : "",
      registration_url: editing.registration_url ?? "",
      organizer_id: editing.organizer?.id ?? (editing.custom_organizer_name ? OTHER_ORGANIZER : NO_ORGANIZER),
      custom_organizer_name: editing.custom_organizer_name ?? "",
      subdirection_ids: (editing.tags ?? []).map((t) => t.id),
      is_featured: editing.is_featured,
      seo_title: editing.seo_title ?? "",
      meta_description: editing.meta_description ?? "",
      status: (editing.status as any) || "approved",
    });
    setOtherDates(
      (editing.other_dates ?? []).map((d) => ({
        label: d.label,
        at: toLocalInput(d.at),
      })),
    );
    setTypeSelections(
      (editing.types ?? []).map((a, i) =>
        a.type
          ? { id: a.type.id, isCustom: false, customName: "" }
          : {
              id: `custom-${a.id || i}`,
              isCustom: true,
              customName: a.custom_name ?? "",
            },
      ),
    );
  }, [editing]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const addType = (typeId: string) => {
    if (!typeId) return;
    if (typeSelections.some((t) => t.id === typeId && !t.isCustom)) return;
    setTypeSelections((prev) => [
      ...prev,
      { id: typeId, isCustom: false, customName: "" },
    ]);
  };
  const addCustomType = () =>
    setTypeSelections((prev) => [
      ...prev,
      { id: `custom-${Date.now()}`, isCustom: true, customName: "" },
    ]);
  const updateCustomName = (id: string, name: string) =>
    setTypeSelections((prev) =>
      prev.map((t) => (t.id === id ? { ...t, customName: name } : t)),
    );
  const removeType = (id: string) =>
    setTypeSelections((prev) => prev.filter((t) => t.id !== id));

  const toggleSubdirection = (sid: string) =>
    setForm((prev) => ({
      ...prev,
      subdirection_ids: prev.subdirection_ids.includes(sid)
        ? prev.subdirection_ids.filter((x) => x !== sid)
        : [...prev.subdirection_ids, sid],
    }));

  const addOtherDate = () =>
    setOtherDates((prev) => [...prev, { label: "", at: "" }]);
  const updateOtherDate = (i: number, patch: Partial<OtherDateInput>) =>
    setOtherDates((prev) =>
      prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)),
    );
  const removeOtherDate = (i: number) =>
    setOtherDates((prev) => prev.filter((_, idx) => idx !== i));

  /* ── Submit ──────────────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.title.trim()) nextErrors.title = "Название обязательно";
    if (!form.start_at) nextErrors.start_at = "Дата начала обязательна";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      toast.error("Проверьте форму");
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      // other_dates: strip blank rows, convert to ISO, skip rows with
      // no label or no date — the backend rejects empty labels.
      const cleanOther = otherDates
        .filter((d) => d.label.trim() && d.at)
        .map((d) => ({
          label: d.label.trim(),
          at: new Date(d.at).toISOString(),
        }));

      const payload: EventPayload = {
        title: form.title.trim(),
        start_at: new Date(form.start_at).toISOString(),
        short_description: form.short_description.trim() || null,
        description: form.description.trim() || null,
        mdx_content: form.mdx_content.trim() || null,
        cover_image_src: form.cover_image_src.trim() || null,
        href: form.href.trim() || null,
        end_at: form.end_at ? new Date(form.end_at).toISOString() : null,
        registration_deadline: form.registration_deadline
          ? new Date(form.registration_deadline).toISOString()
          : null,
        other_dates: cleanOther,
        location_name: form.location_name.trim() || null,
        address: form.address.trim() || null,
        price: form.price.trim() || null,
        capacity: form.capacity ? Number(form.capacity) : null,
        registration_url: form.registration_url.trim() || null,
        organizer_id:
          form.organizer_id === NO_ORGANIZER || form.organizer_id === OTHER_ORGANIZER
            ? null
            : form.organizer_id,
        custom_organizer_name:
          form.organizer_id === OTHER_ORGANIZER
            ? form.custom_organizer_name.trim() || null
            : null,
        types: typeSelections.map((t) =>
          t.isCustom
            ? { custom_name: t.customName.trim() || "Другое" }
            : { type_id: t.id },
        ),
        subdirection_ids: form.subdirection_ids,
      };

      if (mode === "admin") {
        payload.status = form.status;
        payload.is_featured = form.is_featured;
        payload.seo_title = form.seo_title.trim() || null;
        payload.meta_description = form.meta_description.trim() || null;
      }

      if (editing) {
        await updateEvent(editing.slug, payload);
        toast.success("Событие обновлено");
      } else {
        await createEvent(payload);
        toast.success(
          mode === "admin"
            ? "Событие создано"
            : "Событие отправлено на модерацию",
          { duration: 6000 },
        );
      }
      router.push(redirectAfter || "/events");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Не удалось сохранить");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedOrganizer = useMemo(
    () =>
      form.organizer_id === NO_ORGANIZER
        ? null
        : organizers.find((o) => o.id === form.organizer_id) ?? null,
    [form.organizer_id, organizers],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Основное ─────────────────────────────────────────────── */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-5">
        <h2 className="text-heading-3">Основное</h2>

        <Field data-invalid={!!errors.title}>
          <FieldLabel>
            Название <span className="text-destructive">*</span>
          </FieldLabel>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
          {errors.title && <FieldError errors={[{ message: errors.title }]} />}
        </Field>

        <Field>
          <FieldLabel>Короткое описание</FieldLabel>
          <Input
            value={form.short_description}
            onChange={(e) => set("short_description", e.target.value)}
            placeholder="Одно предложение для карточки"
          />
        </Field>

        <Field>
          <FieldLabel>Краткое описание</FieldLabel>
          <Textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Пара абзацев — что это за событие, для кого"
            className="min-h-[100px]"
          />
        </Field>

        <Field>
          <FieldLabel>Контент события</FieldLabel>
          <MdxEditor
            value={form.mdx_content}
            onChange={(v) => set("mdx_content", v)}
            minHeight={320}
          />
          <p className="text-body-5 text-(--on-bg-low) mt-1">
            Поддерживает Markdown. Правый столбец — превью того, как
            событие будет выглядеть на странице.
          </p>
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field data-invalid={!!errors.start_at}>
            <FieldLabel>
              <CalendarBlankIcon className="size-3.5" />
              Начало <span className="text-destructive">*</span>
            </FieldLabel>
            <DateTimePicker
              value={form.start_at}
              onChange={(v) => set("start_at", v)}
              placeholder="Дата и время начала"
              clearable={false}
            />
            {errors.start_at && (
              <FieldError errors={[{ message: errors.start_at }]} />
            )}
          </Field>
          <Field>
            <FieldLabel>
              <CalendarBlankIcon className="size-3.5" />
              Конец
            </FieldLabel>
            <DateTimePicker
              value={form.end_at}
              onChange={(v) => set("end_at", v)}
              placeholder="Дата и время окончания"
            />
          </Field>
          <Field>
            <FieldLabel>
              <CalendarCheckIcon className="size-3.5" />
              Дедлайн регистрации
            </FieldLabel>
            <DateTimePicker
              value={form.registration_deadline}
              onChange={(v) => set("registration_deadline", v)}
              placeholder="Дедлайн регистрации"
            />
          </Field>
          <Field>
            <FieldLabel>Ссылка на регистрацию</FieldLabel>
            <Input
              value={form.registration_url}
              onChange={(e) => set("registration_url", e.target.value)}
              placeholder="https://…"
            />
          </Field>
        </div>
      </Card>

      {/* ── Дополнительные даты ──────────────────────────────────── */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <div>
          <h2 className="text-heading-3">Дополнительные даты</h2>
          <p className="text-body-5 text-(--on-bg-low) mt-0.5">
            Отборочные, полуфиналы, объявление результатов, финалы
          </p>
        </div>

        {otherDates.length > 0 && (
          <div className="space-y-2">
            {otherDates.map((d, i) => (
              <div key={i} className="flex items-start gap-2">
                <DateTimePicker
                  value={d.at}
                  onChange={(v) => updateOtherDate(i, { at: v })}
                  className="max-w-[260px] shrink-0"
                />
                <Input
                  value={d.label}
                  onChange={(e) => updateOtherDate(i, { label: e.target.value })}
                  placeholder="Что за дата (например, «Полуфинал»)"
                />
                <Button
                  type="button"
                  variant="text"
                  size="icon-small"
                  onClick={() => removeOtherDate(i)}
                  className="shrink-0 mt-1"
                  aria-label="Удалить"
                >
                  <TrashIcon className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button type="button" variant="outlined" size="small" onClick={addOtherDate}>
          <PlusIcon className="size-4" />
          Добавить дату
        </Button>
      </Card>

      {/* ── Место ────────────────────────────────────────────────── */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <h2 className="text-heading-3">Место</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Место</FieldLabel>
            <Input
              value={form.location_name}
              onChange={(e) => set("location_name", e.target.value)}
              placeholder="Манеж, Технопарк, Отель…"
            />
          </Field>
          <Field>
            <FieldLabel>Адрес</FieldLabel>
            <Input
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Москва, Манежная пл., 1"
            />
          </Field>
          <Field>
            <FieldLabel>Цена</FieldLabel>
            <Input
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder="Бесплатно"
            />
          </Field>
          <Field>
            <FieldLabel>Вместимость</FieldLabel>
            <Input
              type="number"
              value={form.capacity}
              onChange={(e) => set("capacity", e.target.value)}
              placeholder="500"
            />
          </Field>
        </div>
      </Card>

      {/* ── Обложка ─────────────────────────────────────────────── */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <div>
          <h2 className="text-heading-3">Обложка</h2>
          <p className="text-body-5 text-(--on-bg-low) mt-0.5">
            Загрузите изображение, обрежьте под 4:3. Необязательно.
          </p>
        </div>
        <ImageUploadField
          value={form.cover_image_src}
          onChange={(url) => set("cover_image_src", url)}
          aspect={4 / 3}
          outputSize={1200}
          variant="cover"
          maxSizeMb={8}
        />
        <Field>
          <FieldLabel className="text-body-5 text-(--on-bg-low)">
            Или вставьте URL
          </FieldLabel>
          <Input
            value={form.cover_image_src}
            onChange={(e) => set("cover_image_src", e.target.value)}
            placeholder="/order_files/uploads/… или https://…"
            className="font-mono text-body-4"
          />
        </Field>

        {/* Live card preview — renders the exact composition the
            events grid uses, so the author sees whether the crop
            works before saving. */}
        <div>
          <p className="text-body-5 uppercase tracking-[0.18em] text-(--on-bg-low) mb-3">
            Превью карточки
          </p>
          <EventCardPreview
            title={form.title || "Название события"}
            shortDescription={form.short_description}
            coverUrl={form.cover_image_src}
            startAt={form.start_at}
            location={form.location_name}
            organizer={selectedOrganizer}
            customOrganizer={form.custom_organizer_name}
            firstType={
              typeSelections.find((t) => !t.isCustom)
                ? types.find((t) => t.id === typeSelections.find((x) => !x.isCustom)?.id)
                : null
            }
            customType={
              typeSelections.find((t) => t.isCustom)?.customName || null
            }
            isFeatured={form.is_featured}
          />
        </div>
      </Card>

      {/* ── Организатор ──────────────────────────────────────────── */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <div>
          <h2 className="text-heading-3">Организатор</h2>
          <p className="text-body-5 text-(--on-bg-low) mt-0.5">
            Выберите из существующих. Новых добавляет администратор.
          </p>
        </div>

        <Field>
          <FieldLabel>Кто проводит</FieldLabel>
          <Select
            value={form.organizer_id}
            onValueChange={(v) => {
              set("organizer_id", v);
              if (v !== OTHER_ORGANIZER) set("custom_organizer_name", "");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Без организатора" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_ORGANIZER}>Без организатора</SelectItem>
              {organizers.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  <span className="flex items-center gap-2">
                    {o.avatar_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={o.avatar_url}
                        alt=""
                        className="size-5 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <span
                        className="size-5 rounded-full shrink-0 flex items-center justify-center text-[9px] font-semibold"
                        style={{
                          background: o.color
                            ? `color-mix(in srgb, ${o.color} 22%, transparent)`
                            : "var(--state-hover)",
                          color: o.color || "var(--on-bg-medium)",
                        }}
                      >
                        {o.name.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <span>{o.name}</span>
                  </span>
                </SelectItem>
              ))}
              <SelectItem value={OTHER_ORGANIZER}>
                Другой организатор
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>

        {form.organizer_id === OTHER_ORGANIZER && (
          <Field>
            <FieldLabel>Название организатора</FieldLabel>
            <Input
              value={form.custom_organizer_name}
              onChange={(e) => set("custom_organizer_name", e.target.value)}
              placeholder="Например, Университет ИТМО"
            />
            <p className="text-body-5 text-(--on-bg-low) mt-1">
              Администратор проверит и добавит организатора в справочник.
            </p>
          </Field>
        )}

        {selectedOrganizer && (
          <div className="flex items-center gap-3 rounded-2xl border border-(--outline) bg-(--bg) p-3">
            {selectedOrganizer.avatar_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={selectedOrganizer.avatar_url}
                alt=""
                className="size-10 rounded-xl object-cover shrink-0"
              />
            ) : (
              <span
                className="flex size-10 items-center justify-center rounded-xl text-body-3 font-semibold shrink-0"
                style={{
                  background: selectedOrganizer.color
                    ? `color-mix(in srgb, ${selectedOrganizer.color} 22%, transparent)`
                    : "var(--state-hover)",
                  color: selectedOrganizer.color || "var(--on-bg-high)",
                }}
              >
                {selectedOrganizer.name.slice(0, 1).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-body-3 font-medium truncate">
                {selectedOrganizer.name}
              </p>
              {selectedOrganizer.description && (
                <p className="text-body-5 text-(--on-bg-low) truncate">
                  {selectedOrganizer.description}
                </p>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* ── Типы ─────────────────────────────────────────────────── */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <div>
          <h2 className="text-heading-3">Типы события</h2>
          <p className="text-body-5 text-(--on-bg-low) mt-0.5">
            IT, Бизнес, Дизайн… Можно несколько.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {types.map((t) => {
            const selected = typeSelections.some(
              (x) => x.id === t.id && !x.isCustom,
            );
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => (selected ? removeType(t.id) : addType(t.id))}
                className={
                  "rounded-full px-3 py-1.5 text-body-4 font-medium transition-colors " +
                  (selected
                    ? "bg-(--primary) text-(--on-primary)"
                    : "bg-(--card) border border-(--outline) text-(--on-bg-medium) hover:text-(--on-bg-high)")
                }
              >
                {t.name}
              </button>
            );
          })}
          <button
            type="button"
            onClick={addCustomType}
            className="rounded-full px-3 py-1.5 text-body-4 font-medium border border-dashed border-(--outline) text-(--on-bg-low) hover:border-(--on-bg-high) hover:text-(--on-bg-high) transition-colors inline-flex items-center gap-1"
          >
            <PlusIcon className="size-3.5" />
            Другое
          </button>
        </div>

        {types.length === 0 && !metaError && (
          <p className="text-body-5 text-(--on-bg-low)">
            Справочник типов пуст — можно добавить свой через «Другое».
          </p>
        )}

        {types.length === 0 && metaError && (
          <p className="text-body-5 text-destructive">{metaError}</p>
        )}

        {typeSelections
          .filter((t) => t.isCustom)
          .map((t) => (
            <div key={t.id} className="flex items-center gap-2">
              <Input
                value={t.customName}
                onChange={(e) => updateCustomName(t.id, e.target.value)}
                placeholder="Название типа"
              />
              <Button
                type="button"
                variant="text"
                size="icon-small"
                onClick={() => removeType(t.id)}
              >
                <TrashIcon className="size-4" />
              </Button>
            </div>
          ))}
      </Card>

      {/* ── Вершины / Направления ────────────────────────────────── */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-5">
        <div>
          <h2 className="text-heading-3">Вершины</h2>
          <p className="text-body-5 text-(--on-bg-low) mt-0.5">
            Направления, к которым относится событие. Необязательно.
          </p>
        </div>

        {metaError && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-body-5 text-destructive">{metaError}</p>
          </div>
        )}

        {directions.length === 0 && !metaError && (
          <div className="rounded-2xl border border-dashed border-(--outline) p-6 text-center">
            <p className="text-body-4 text-(--on-bg-medium)">
              Справочник направлений пока пуст.
            </p>
            <p className="text-body-5 text-(--on-bg-low) mt-1">
              Администратор может заполнить его в панели «Направления».
            </p>
          </div>
        )}

        {directions.map((d) => (
          <div key={d.id} className="space-y-2">
            <p className="text-body-3 font-medium text-(--on-bg-high)">
              {d.emoji ? `${d.emoji} ` : ""}
              {d.name}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {d.subdirections.map((s) => {
                const on = form.subdirection_ids.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSubdirection(s.id)}
                    className={
                      "rounded-full px-3 py-1 text-body-4 font-medium transition-colors " +
                      (on
                        ? "bg-(--primary) text-(--on-primary)"
                        : "bg-(--bg) border border-(--outline) text-(--on-bg-medium) hover:text-(--on-bg-high) hover:border-(--on-bg-low)")
                    }
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </Card>

      {/* ── Admin-only ──────────────────────────────────────────── */}
      {mode === "admin" && (
        <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
          <h2 className="text-heading-3">Администрирование</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Статус публикации</FieldLabel>
              <Select
                value={form.status}
                onValueChange={(v) => set("status", v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">На модерации</SelectItem>
                  <SelectItem value="approved">Опубликовано</SelectItem>
                  <SelectItem value="rejected">Отклонено</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={form.is_featured}
                  onCheckedChange={(v) => set("is_featured", v === true)}
                />
                <Label className="text-body-4">Избранное событие</Label>
              </label>
            </div>
          </div>
          <Field>
            <FieldLabel>SEO title</FieldLabel>
            <Input
              value={form.seo_title}
              onChange={(e) => set("seo_title", e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>Meta description</FieldLabel>
            <Textarea
              value={form.meta_description}
              onChange={(e) => set("meta_description", e.target.value)}
              className="min-h-[70px]"
            />
          </Field>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="large" disabled={submitting}>
          {submitting && <CircleNotchIcon className="size-4 animate-spin" />}
          {editing
            ? "Сохранить изменения"
            : mode === "admin"
              ? "Создать событие"
              : "Отправить на модерацию"}
        </Button>
        <Button
          type="button"
          variant="outlined"
          size="large"
          onClick={() => router.back()}
          disabled={submitting}
        >
          Отмена
        </Button>
      </div>
    </form>
  );
}

/** ISO → local datetime-local input string (YYYY-MM-DDTHH:MM). */
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}


/* ── Card preview ──────────────────────────────────────────────────
   A 1:1 clone of the events grid card, rendered live from the form
   state. The `aspect-[16/10]` and the dark organizer chip in the
   top-left match `EventCard` in the user profile page — if the
   event card layout changes there, update both. */
function EventCardPreview({
  title,
  shortDescription,
  coverUrl,
  startAt,
  location,
  organizer,
  customOrganizer,
  firstType,
  customType,
  isFeatured,
}: {
  title: string;
  shortDescription?: string;
  coverUrl?: string;
  startAt?: string;
  location?: string;
  organizer: Organizer | null;
  customOrganizer?: string;
  firstType: EventTypeTaxonomy | null | undefined;
  customType: string | null;
  isFeatured: boolean;
}) {
  const color = organizer
    ? colorForOrganizer(organizer)
    : customOrganizer
      ? "#4a4e54"
      : "#4a4e54";
  const orgLabel = organizer?.name || customOrganizer || "Без организатора";

  const dateLabel = startAt
    ? new Date(startAt).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Дата не указана";

  const typeLabel = firstType?.name || customType;

  return (
    <div className="max-w-sm">
      <div className="group relative flex flex-col rounded-3xl border border-(--outline) bg-(--card) overflow-hidden">
        <div className="relative aspect-[4/3] overflow-hidden bg-(--bg-disabled)">
          {coverUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={coverUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, color-mix(in srgb, ${color} 22%, transparent), color-mix(in srgb, ${color} 4%, transparent))`,
              }}
            />
          )}
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
            <span
              className="size-1.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            {orgLabel}
          </span>
        </div>

        <div className="flex-1 flex flex-col p-5">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {typeLabel && (
              <Badge variant="tonal-card-static" size="chip-small">
                {typeLabel}
              </Badge>
            )}
            {isFeatured && (
              <Badge variant="tonal-primary-static" size="chip-small">
                ★
              </Badge>
            )}
          </div>

          <h3 className="text-heading-3 leading-tight text-(--on-bg-high) mb-3 line-clamp-2">
            {title}
          </h3>

          {shortDescription && (
            <p className="text-body-4 text-(--on-bg-medium) leading-relaxed line-clamp-2 mb-5">
              {shortDescription}
            </p>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-body-5 text-(--on-bg-low) mt-auto pt-4 border-t border-(--outline)">
            <span className="inline-flex items-center gap-1.5">
              <CalendarBlankIcon className="size-3.5" />
              {dateLabel}
            </span>
            {location && (
              <span className="inline-flex items-center gap-1.5 truncate">
                <MapPinIcon className="size-3.5 shrink-0" />
                <span className="truncate">{location}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
