"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CircleNotchIcon } from "@phosphor-icons/react";
import {
  createEvent,
  updateEvent,
  type EventDetail,
  type EventPayload,
} from "@/utils/api/events";
import {
  fetchOrganizersPublic,
  fetchEventTypesPublic,
  fetchDirectionsPublic,
  type Organizer,
  type EventTypeTaxonomy,
  type Direction,
} from "@/utils/api/event-taxonomies";

interface Props {
  /** null → create. Non-null → edit that slug. */
  editing: EventDetail | null;
  /** "admin" saves immediately as approved (if status=approved). "user" always saves as pending. */
  mode: "admin" | "user";
  /** Where to go after a successful save. */
  redirectAfter?: string;
}

export function EventEditorForm({ editing, mode, redirectAfter }: Props) {
  const router = useRouter();
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [types, setTypes] = useState<EventTypeTaxonomy[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const [form, setForm] = useState({
    title: "",
    short_description: "",
    description: "",
    cover_image_src: "",
    href: "",
    start_at: "",
    end_at: "",
    location_name: "",
    address: "",
    metro: "",
    city: "",
    price: "",
    capacity: "",
    registration_url: "",
    organizer_id: "",
    subdirection_ids: [] as string[],
    is_featured: false,
    seo_title: "",
    meta_description: "",
    mdx_content: "",
    status: "approved" as "pending" | "approved" | "rejected",
  });

  const [typeSelections, setTypeSelections] = useState<
    Array<{ id: string; isCustom: boolean; customName: string }>
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Load taxonomy once ──────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetchOrganizersPublic(),
      fetchEventTypesPublic(),
      fetchDirectionsPublic(),
    ])
      .then(([o, t, d]) => {
        setOrganizers(o);
        setTypes(t);
        setDirections(d);
      })
      .catch(() => toast.error("Не удалось загрузить справочники"))
      .finally(() => setLoadingMeta(false));
  }, []);

  // ── Hydrate from `editing` when present ─────────────────────────
  useEffect(() => {
    if (!editing) return;
    setForm({
      title: editing.title,
      short_description: editing.short_description ?? "",
      description: editing.description ?? "",
      cover_image_src: editing.cover_image_src ?? "",
      href: editing.href ?? "",
      start_at: toLocalInput(editing.start_at),
      end_at: toLocalInput(editing.end_at),
      location_name: editing.location_name ?? "",
      address: editing.address ?? "",
      metro: editing.metro ?? "",
      city: editing.city ?? "",
      price: editing.price ?? "",
      capacity: editing.capacity ? String(editing.capacity) : "",
      registration_url: editing.registration_url ?? "",
      organizer_id: editing.organizer?.id ?? "",
      subdirection_ids: (editing.tags ?? []).map((t) => t.id),
      is_featured: editing.is_featured,
      seo_title: editing.seo_title ?? "",
      meta_description: editing.meta_description ?? "",
      mdx_content: editing.mdx_content ?? "",
      status: (editing.status as any) || "approved",
    });
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
    setTypeSelections((prev) => [...prev, { id: typeId, isCustom: false, customName: "" }]);
  };
  const addCustomType = () =>
    setTypeSelections((prev) => [
      ...prev,
      { id: `custom-${Date.now()}`, isCustom: true, customName: "" },
    ]);
  const updateCustomName = (id: string, name: string) =>
    setTypeSelections((prev) => prev.map((t) => (t.id === id ? { ...t, customName: name } : t)));
  const removeType = (id: string) =>
    setTypeSelections((prev) => prev.filter((t) => t.id !== id));

  const toggleSubdirection = (sid: string) =>
    setForm((prev) => ({
      ...prev,
      subdirection_ids: prev.subdirection_ids.includes(sid)
        ? prev.subdirection_ids.filter((x) => x !== sid)
        : [...prev.subdirection_ids, sid],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.title.trim()) nextErrors.title = "Название обязательно";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      toast.error("Проверьте форму");
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const payload: EventPayload = {
        title: form.title.trim(),
        short_description: form.short_description.trim() || null,
        description: form.description.trim() || null,
        cover_image_src: form.cover_image_src.trim() || null,
        href: form.href.trim() || null,
        start_at: form.start_at ? new Date(form.start_at).toISOString() : null,
        end_at: form.end_at ? new Date(form.end_at).toISOString() : null,
        location_name: form.location_name.trim() || null,
        address: form.address.trim() || null,
        metro: form.metro.trim() || null,
        city: form.city.trim() || null,
        price: form.price.trim() || null,
        capacity: form.capacity ? Number(form.capacity) : null,
        registration_url: form.registration_url.trim() || null,
        organizer_id: form.organizer_id || null,
        types: typeSelections.map((t) =>
          t.isCustom
            ? { custom_name: t.customName.trim() || "Другое" }
            : { type_id: t.id },
        ),
        subdirection_ids: form.subdirection_ids,
      };

      if (mode === "admin") {
        // Admin can set publication status directly.
        payload.status = form.status;
        payload.is_featured = form.is_featured;
        payload.seo_title = form.seo_title.trim() || null;
        payload.meta_description = form.meta_description.trim() || null;
        payload.mdx_content = form.mdx_content.trim() || null;
      }

      if (editing) {
        await updateEvent(editing.slug, payload);
        toast.success("Событие обновлено");
      } else {
        await createEvent(payload);
        toast.success(
          mode === "admin"
            ? "Событие создано"
            : "Событие отправлено на модерацию. Мы сообщим после проверки.",
          { duration: 6000 },
        );
      }
      router.push(redirectAfter || "/");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Не удалось сохранить");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basics */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
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
          <FieldLabel>Полное описание</FieldLabel>
          <Textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="min-h-[120px]"
          />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Начало</FieldLabel>
            <Input
              type="datetime-local"
              value={form.start_at}
              onChange={(e) => set("start_at", e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>Конец</FieldLabel>
            <Input
              type="datetime-local"
              value={form.end_at}
              onChange={(e) => set("end_at", e.target.value)}
            />
          </Field>
        </div>
        <Field>
          <FieldLabel>Ссылка на сайт события</FieldLabel>
          <Input
            value={form.href}
            onChange={(e) => set("href", e.target.value)}
            placeholder="https://…"
          />
        </Field>
        <Field>
          <FieldLabel>Обложка (URL)</FieldLabel>
          <Input
            value={form.cover_image_src}
            onChange={(e) => set("cover_image_src", e.target.value)}
            placeholder="/order_files/uploads/… или https://…"
          />
        </Field>
      </Card>

      {/* Location & registration */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <h2 className="text-heading-3">Место и регистрация</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Место</FieldLabel>
            <Input value={form.location_name} onChange={(e) => set("location_name", e.target.value)} />
          </Field>
          <Field>
            <FieldLabel>Город</FieldLabel>
            <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel>Адрес</FieldLabel>
            <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
          </Field>
          <Field>
            <FieldLabel>Метро</FieldLabel>
            <Input value={form.metro} onChange={(e) => set("metro", e.target.value)} />
          </Field>
          <Field>
            <FieldLabel>Цена</FieldLabel>
            <Input value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="Бесплатно" />
          </Field>
          <Field>
            <FieldLabel>Вместимость</FieldLabel>
            <Input type="number" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} />
          </Field>
          <Field>
            <FieldLabel>Ссылка на регистрацию</FieldLabel>
            <Input
              value={form.registration_url}
              onChange={(e) => set("registration_url", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      {/* Organizer */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <h2 className="text-heading-3">Организатор</h2>
        <Field>
          <FieldLabel>Кто проводит</FieldLabel>
          <Select
            value={form.organizer_id}
            onValueChange={(v) => set("organizer_id", v)}
            disabled={loadingMeta}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите…" />
            </SelectTrigger>
            <SelectContent>
              {organizers.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </Card>

      {/* Types */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <h2 className="text-heading-3">
          Типы{" "}
          <span className="text-body-5 text-(--on-bg-low) font-normal">
            (можно несколько)
          </span>
        </h2>
        <div className="flex flex-wrap gap-2">
          {types.map((t) => {
            const selected = typeSelections.some((x) => x.id === t.id && !x.isCustom);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => (selected ? removeType(t.id) : addType(t.id))}
                className={
                  "rounded-full px-3 py-1.5 text-body-4 font-medium transition-colors " +
                  (selected
                    ? "bg-(--primary) text-white"
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
            className="rounded-full px-3 py-1.5 text-body-4 font-medium border border-dashed border-(--outline) text-(--on-bg-low) hover:border-(--primary) hover:text-(--primary) transition-colors"
          >
            + Другое
          </button>
        </div>
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
                ✕
              </Button>
            </div>
          ))}
      </Card>

      {/* Tags */}
      {directions.length > 0 && (
        <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
          <h2 className="text-heading-3">Направления</h2>
          <p className="text-body-4 text-(--on-bg-medium)">
            Выберите одно или несколько направлений из Вершин.
          </p>
          <div className="space-y-4">
            {directions.map((d) => (
              <div key={d.id}>
                <p className="text-body-4 font-medium text-(--on-bg-high) mb-2">
                  {d.emoji} {d.name}
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
                          "rounded-full px-2.5 py-1 text-body-5 font-medium transition-colors " +
                          (on
                            ? "bg-(--primary) text-white"
                            : "bg-(--bg) border border-(--outline) text-(--on-bg-medium) hover:text-(--on-bg-high)")
                        }
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Admin-only block */}
      {mode === "admin" && (
        <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
          <h2 className="text-heading-3">Администрирование</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Статус публикации</FieldLabel>
              <Select value={form.status} onValueChange={(v) => set("status", v as any)}>
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
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer pb-2">
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
            <Input value={form.seo_title} onChange={(e) => set("seo_title", e.target.value)} />
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

/** ISO string → the `datetime-local` input format (`YYYY-MM-DDTHH:MM`). */
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
