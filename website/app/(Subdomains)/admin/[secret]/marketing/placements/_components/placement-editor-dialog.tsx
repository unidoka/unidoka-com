"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { ImageUploadField } from "@/components/editor/image-upload-field";
import { toast } from "sonner";
import { CircleNotchIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  createPlacement,
  updatePlacement,
  type MarketingPlacement,
  type PlacementPayload,
  type PlacementType,
  type PlacementAction,
  type ActionVariant,
} from "@/utils/api/marketing";

/**
 * Page targets. Kept as pills rather than a free-text field so the
 * admin can't typo a route and silently produce a placement that never
 * renders. Adding a new page means adding one entry here AND mounting
 * `<PlacementSlot page="…" />` in that page's tree — see the comment
 * in components/marketing/placements/placement-slot.tsx.
 */
const PAGE_OPTIONS: { value: string; label: string }[] = [
  { value: "global", label: "Везде" },
  { value: "home", label: "Главная" },
  { value: "events", label: "События" },
  { value: "solutions", label: "Решения" },
  { value: "amorfa", label: "Amorfa" },
  { value: "vershiny", label: "Вершины" },
];

const TYPE_OPTIONS: { value: PlacementType; label: string; hint: string }[] = [
  { value: "top", label: "Верхняя полоса", hint: "Над контентом страницы" },
  { value: "card", label: "Карточка", hint: "Внутри секции как инфо-блок" },
  { value: "toast", label: "Уведомление", hint: "В правом нижнем углу" },
  { value: "dialog", label: "Модальное окно", hint: "По центру экрана" },
];

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: MarketingPlacement | null;
  onSaved: () => void;
}

export function PlacementEditorDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: Props) {
  const isEdit = !!editing;
  const [form, setForm] = useState<PlacementPayload>({
    title: "",
    placement_type: "top",
    page: "global",
    heading: "",
    body: "",
    image_url: "",
    actions: [],
    accent_color: "",
    start_at: null,
    end_at: null,
    is_active: true,
    priority: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        title: editing.title,
        slug: editing.slug,
        placement_type: editing.placement_type,
        page: editing.page,
        heading: editing.heading ?? "",
        body: editing.body ?? "",
        image_url: editing.image_url ?? "",
        actions: editing.actions ?? [],
        accent_color: editing.accent_color ?? "",
        start_at: editing.start_at,
        end_at: editing.end_at,
        is_active: editing.is_active,
        priority: editing.priority,
      });
    } else {
      setForm({
        title: "",
        placement_type: "top",
        page: "global",
        heading: "",
        body: "",
        image_url: "",
        actions: [],
        accent_color: "",
        start_at: null,
        end_at: null,
        is_active: true,
        priority: 0,
      });
    }
    setErrors({});
  }, [open, editing]);

  const set = <K extends keyof PlacementPayload>(
    key: K,
    value: PlacementPayload[K],
  ) => setForm((p) => ({ ...p, [key]: value }));

  // Client-side window check mirrors the server rule. Rejecting here
  // saves a round trip; the server still enforces it for API callers.
  const windowInvalid = useMemo(() => {
    if (!form.start_at || !form.end_at) return false;
    return new Date(form.end_at) < new Date(form.start_at);
  }, [form.start_at, form.end_at]);

  const handleSave = async () => {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = "Название обязательно";
    if (windowInvalid) next.end_at = "Дата окончания должна быть позже начала";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      // Strip empty strings → null so the backend treats them as
      // "field absent" rather than "explicitly blank".
      const payload: PlacementPayload = {
        ...form,
        title: form.title.trim(),
        heading: form.heading?.trim() || null,
        body: form.body?.trim() || null,
        image_url: form.image_url?.trim() || null,
        // Drop empty action rows before sending — the admin might have
        // added a row and left it blank, and a blank action would
        // render as an unlabeled button.
        actions: (form.actions ?? []).filter(
          (a) => a.label.trim() && a.url.trim(),
        ),
        accent_color: form.accent_color?.trim() || null,
      };
      if (isEdit && editing) {
        await updatePlacement(editing.slug, payload);
        toast.success("Размещение обновлено");
      } else {
        await createPlacement(payload);
        toast.success("Размещение создано");
      }
      onOpenChange(false);
      onSaved();
    } catch (e: any) {
      toast.error(e?.message || "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto scrollbar-admin p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-(--outline) sticky top-0 bg-(--card) z-10">
          <DialogTitle>
            {isEdit ? "Редактировать размещение" : "Новое размещение"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 space-y-6">
          {/* ── Основное ────────────────────────────────────────── */}
          <section className="space-y-4">
            <h3 className="text-body-5 uppercase tracking-[0.14em] text-(--on-bg-low)">
              Основное
            </h3>
            <Field data-invalid={!!errors.title}>
              <FieldLabel>
                Внутреннее название <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Весенняя кампания 2026"
              />
              {errors.title && <FieldError errors={[{ message: errors.title }]} />}
              <p className="text-body-5 text-(--on-bg-low) mt-1">
                Видно только в админке. Не показывается пользователям.
              </p>
            </Field>
          </section>

          {/* ── Тип и место ──────────────────────────────────────── */}
          <section className="space-y-4">
            <h3 className="text-body-5 uppercase tracking-[0.14em] text-(--on-bg-low)">
              Где показывать
            </h3>

            <Field>
              <FieldLabel>Тип размещения</FieldLabel>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TYPE_OPTIONS.map((t) => {
                  const active = form.placement_type === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => set("placement_type", t.value)}
                      className={cn(
                        "rounded-xl border p-3 text-left transition-colors",
                        active
                          ? "border-(--primary) bg-(--primary-glass)"
                          : "border-(--outline) hover:border-(--on-bg-low)",
                      )}
                    >
                      <p
                        className={cn(
                          "text-body-4 font-medium mb-1",
                          active ? "text-(--primary)" : "text-(--on-bg-high)",
                        )}
                      >
                        {t.label}
                      </p>
                      <p className="text-body-6 text-(--on-bg-low) leading-tight">
                        {t.hint}
                      </p>
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field>
              <FieldLabel>Категория страниц</FieldLabel>
              <div className="flex flex-wrap gap-1.5">
                {PAGE_OPTIONS.map((p) => {
                  const active = form.page === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => set("page", p.value)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-body-4 font-medium transition-colors",
                        active
                          ? "bg-(--primary) text-(--on-primary)"
                          : "bg-(--card) border border-(--outline) text-(--on-bg-medium) hover:text-(--on-bg-high)",
                      )}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-body-5 text-(--on-bg-low) mt-2">
                «Везде» — на всех страницах, где смонтирован слот этого типа.
                Категория совпадает с префиксом маршрута.
              </p>
            </Field>

            <Field>
              <FieldLabel>Приоритет</FieldLabel>
              <Input
                type="number"
                value={form.priority}
                onChange={(e) => set("priority", Number(e.target.value) || 0)}
                placeholder="0"
                className="max-w-[140px]"
              />
              <p className="text-body-5 text-(--on-bg-low) mt-1">
                Если в одном слоте несколько активных размещений — показываются
                все, отсортированные по убыванию приоритета.
              </p>
            </Field>
          </section>

          {/* ── Расписание ──────────────────────────────────────── */}
          <section className="space-y-4">
            <h3 className="text-body-5 uppercase tracking-[0.14em] text-(--on-bg-low)">
              Расписание
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Начало</FieldLabel>
                <DateTimePicker
                  value={form.start_at ?? ""}
                  onChange={(v) => set("start_at", v || null)}
                  placeholder="Без ограничения"
                />
                <p className="text-body-5 text-(--on-bg-low) mt-1">
                  Пусто = показывать сразу после активации
                </p>
              </Field>
              <Field data-invalid={!!errors.end_at}>
                <FieldLabel>Окончание</FieldLabel>
                <DateTimePicker
                  value={form.end_at ?? ""}
                  onChange={(v) => set("end_at", v || null)}
                  placeholder="Без ограничения"
                />
                {errors.end_at ? (
                  <FieldError errors={[{ message: errors.end_at }]} />
                ) : (
                  <p className="text-body-5 text-(--on-bg-low) mt-1">
                    Пусто = показывать до ручного отключения
                  </p>
                )}
              </Field>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-(--outline) bg-(--bg) px-4 py-3">
              <div>
                <Label className="text-body-4 font-medium">Активно</Label>
                <p className="text-body-5 text-(--on-bg-low) mt-0.5">
                  Выключите, чтобы поставить на паузу — расписание сохранится.
                </p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => set("is_active", v)}
              />
            </div>
          </section>

          {/* ── Контент ─────────────────────────────────────────── */}
          <section className="space-y-4">
            <h3 className="text-body-5 uppercase tracking-[0.14em] text-(--on-bg-low)">
              Содержимое
            </h3>

            <Field>
              <FieldLabel>Обложка (опционально)</FieldLabel>
              <ImageUploadField
                value={form.image_url ?? ""}
                onChange={(v) => set("image_url", v)}
                aspect={16 / 9}
                outputSize={1200}
                variant="cover"
                maxSizeMb={5}
              />
            </Field>

            <Field>
              <FieldLabel>Заголовок</FieldLabel>
              <Input
                value={form.heading ?? ""}
                onChange={(e) => set("heading", e.target.value)}
                placeholder="Регистрация на хакатон открыта"
              />
            </Field>

            <Field>
              <FieldLabel>Текст</FieldLabel>
              <Textarea
                value={form.body ?? ""}
                onChange={(e) => set("body", e.target.value)}
                className="min-h-[80px]"
                placeholder="Короткое описание, 1–2 предложения"
              />
            </Field>

            <ActionsEditor
              actions={form.actions ?? []}
              onChange={(next) => set("actions", next)}
            />

            <Field>
              <FieldLabel>Акцентный цвет (опционально)</FieldLabel>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.accent_color || "#336DFF"}
                  onChange={(e) => set("accent_color", e.target.value)}
                  className="size-10 rounded-lg border border-(--outline) cursor-pointer bg-transparent p-0.5 shrink-0"
                  aria-label="Акцентный цвет"
                />
                <Input
                  value={form.accent_color ?? ""}
                  onChange={(e) => set("accent_color", e.target.value)}
                  placeholder="#336DFF"
                  className="font-mono text-body-4 max-w-[180px]"
                />
                {form.accent_color && (
                  <Button
                    type="button"
                    variant="text"
                    size="icon-small"
                    onClick={() => set("accent_color", "")}
                    aria-label="Очистить цвет"
                    className="text-(--on-bg-low)"
                  >
                    <TrashIcon className="size-3.5" />
                  </Button>
                )}
              </div>
              <p className="text-body-5 text-(--on-bg-low) mt-1">
                Используется как полоса слева у размещения. Оставьте пустым
                для нейтрального вида.
              </p>
            </Field>
          </section>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-(--outline) sticky bottom-0 bg-(--card)">
          <Button
            variant="outlined"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={saving || windowInvalid}>
            {saving && <CircleNotchIcon className="size-4 animate-spin" />}
            {saving ? "Сохранение…" : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Actions editor ──────────────────────────────────────────────── */

const VARIANT_OPTIONS: { value: ActionVariant; label: string }[] = [
  { value: "primary", label: "Основная" },
  { value: "outlined", label: "Контурная" },
  { value: "text", label: "Текстовая" },
];

function ActionsEditor({
  actions,
  onChange,
}: {
  actions: PlacementAction[];
  onChange: (next: PlacementAction[]) => void;
}) {
  const update = (idx: number, patch: Partial<PlacementAction>) => {
    onChange(actions.map((a, i) => (i === idx ? { ...a, ...patch } : a)));
  };
  const remove = (idx: number) => {
    onChange(actions.filter((_, i) => i !== idx));
  };
  const add = () => {
    onChange([...actions, { label: "", url: "", variant: "primary" }]);
  };

  return (
    <Field>
      <div className="flex items-center justify-between gap-3 mb-2">
        <FieldLabel>Кнопки действий</FieldLabel>
        <Button
          type="button"
          variant="outlined"
          size="small"
          onClick={add}
          disabled={actions.length >= 3}
        >
          <PlusIcon className="size-3.5" />
          Добавить
        </Button>
      </div>

      {actions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-(--outline) p-4 text-center">
          <p className="text-body-5 text-(--on-bg-low)">
            Кнопок нет. Размещение покажет только заголовок и текст.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {actions.map((a, i) => (
            <div
              key={i}
              className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_140px_auto] gap-2 items-start rounded-lg border border-(--outline) p-3"
            >
              <Input
                value={a.label}
                onChange={(e) => update(i, { label: e.target.value })}
                placeholder="Текст кнопки"
              />
              <Input
                value={a.url}
                onChange={(e) => update(i, { url: e.target.value })}
                placeholder="/events или https://…"
                className="font-mono text-body-4"
              />
              <Select
                value={a.variant}
                onValueChange={(v) =>
                  update(i, { variant: v as ActionVariant })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VARIANT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="text"
                size="icon-small"
                onClick={() => remove(i)}
                className="text-(--error) hover:bg-(--error-card) justify-self-end"
                aria-label="Удалить"
              >
                <TrashIcon className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <p className="text-body-5 text-(--on-bg-low) mt-2">
        До трёх кнопок. Основная — залитая, контурная — с обводкой,
        текстовая — без фона. Внутренние ссылки начинаются с «/»,
        внешние — с «http».
      </p>
    </Field>
  );
}
