"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLanguage } from "@/providers/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ImageUploadField } from "./image-upload-field";
import { UnifiedCover } from "./unified-cover";
import { NovelEditor } from "./novel/novel-editor";
import { FloppyDiskIcon, RocketIcon, TrashIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import {
  createEvent, updateEvent, deleteEvent,
  type EventDetail, type EventPayload,
} from "@/utils/api/events";
import { EVENT_CUSTOM_PAGES_META } from "@/app/events/[slug]/_components/event-custom-pages-meta";
import { revalidateTags } from "@/utils/revalidate";

interface SeatType {
  type: string;
  count: number | "";
}

interface FormState {
  slug: string;
  title: string;
  short_description: string;
  description: string;
  cover_image_src: string;
  cover_video_src: string;
  start_at: string;
  end_at: string;
  location_name: string;
  address: string;
  metro: string;
  city: string;
  price: string;
  registration_url: string;
  seat_types: SeatType[];
  custom_page: string | null;
  is_featured: boolean;
  publication_status: "draft" | "published";
  content_json: any | null;
  seo_title: string;
  meta_description: string;
}

function isoToLocalInput(iso?: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

function toFormState(e?: EventDetail | null): FormState {
  if (!e) {
    return {
      slug: "", title: "", short_description: "", description: "",
      cover_image_src: "", cover_video_src: "", start_at: "", end_at: "",
      location_name: "", address: "", metro: "", city: "Москва",
      price: "Бесплатно", registration_url: "", seat_types: [],
      custom_page: null, is_featured: false, publication_status: "draft",
      content_json: null, seo_title: "", meta_description: "",
    };
  }
  return {
    slug: e.slug, title: e.title || "", short_description: e.short_description || "",
    description: e.description || "", cover_image_src: e.cover_image_src || "",
    cover_video_src: e.cover_video_src || "", start_at: isoToLocalInput(e.start_at),
    end_at: isoToLocalInput(e.end_at), location_name: e.location_name || "",
    address: e.address || "", metro: e.metro || "", city: e.city || "Москва",
    price: e.price || "", registration_url: e.registration_url || "",
    seat_types: (e.seat_types || []).map(s => ({ type: s.type, count: s.count })),
    custom_page: e.custom_page ?? null, is_featured: e.is_featured || false,
    publication_status: (e.publication_status as any) || "draft",
    content_json: (e as any).content_json ?? null, seo_title: e.seo_title || "",
    meta_description: e.meta_description || "",
  };
}

export function EventEditorForm({ initial }: { initial?: EventDetail | null }) {
  const { t } = useLanguage();
  const router = useRouter();
  const isEdit = !!initial;
  const [form, setForm] = useState<FormState>(() => toFormState(initial));
  const [saving, setSaving] = useState(false);

  const isCustomPage = !!form.custom_page;

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const addSeatType = () => {
    update("seat_types", [...form.seat_types, { type: "", count: "" }]);
  };

  const updateSeatType = (idx: number, key: keyof SeatType, value: string) => {
    const next = [...form.seat_types];
    if (key === "count") {
      next[idx].count = value ? Number(value) : "";
    } else {
      next[idx].type = value;
    }
    update("seat_types", next);
  };

  const removeSeatType = (idx: number) => {
    update("seat_types", form.seat_types.filter((_, i) => i !== idx));
  };

  const buildPayload = (status: "draft" | "published"): EventPayload => {
    const cleanSeats = form.seat_types
      .filter((s) => s.type.trim() !== "" && s.count !== "")
      .map((s) => ({ type: s.type.trim(), count: Number(s.count) }));

    return {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      short_description: form.short_description.trim(),
      description: form.description.trim(),
      cover_image_src: form.cover_image_src.trim(),
      cover_video_src: form.cover_video_src.trim(),
      start_at: form.start_at ? new Date(form.start_at).toISOString() : null,
      end_at: form.end_at ? new Date(form.end_at).toISOString() : null,
      location_name: form.location_name.trim() || null,
      address: form.address.trim() || null,
      metro: form.metro.trim() || null,
      city: form.city.trim() || null,
      price: form.price.trim() || null,
      registration_url: form.registration_url.trim() || null,
      seat_types: cleanSeats,
      custom_page: form.custom_page,
      is_featured: form.is_featured,
      publication_status: status,
      content_json: form.content_json,
      seo_title: form.seo_title.trim() || null,
      meta_description: form.meta_description.trim() || null,
    } as any;
  };

  const handleSave = async (status: "draft" | "published") => {
    if (!form.title.trim()) {
      toast.error(t("editor.missing_title"));
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload(status);
      const saved = isEdit && initial ? await updateEvent(initial.slug, payload) : await createEvent(payload);
      
      toast.success(status === "published" ? "Событие опубликовано" : "Черновик сохранён");
      await revalidateTags(["events"]);
      
      if (!isEdit) {
        const basePath = window.location.pathname.replace(/\/new\/?$/, "");
        router.replace(`${basePath}/${saved.slug}/edit`);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err?.message || "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initial) return;
    if (!confirm(`Удалить событие «${initial.title}»? Заявки тоже удалятся.`)) return;
    setSaving(true);
    try {
      await deleteEvent(initial.slug);
      await revalidateTags(["events"]);
      toast.success("Удалено");
      router.push("../");
    } catch (err: any) {
      toast.error(err?.message || "Ошибка удаления");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display-2 mb-1">{isEdit ? t("editor.event_title_edit") : t("editor.event_title_new")}</h1>
          {initial && (
            <p className="text-body-4 text-(--on-bg-low)">
              {initial.publication_status === "published" ? t("editor.status_published") : t("editor.status_draft")} · <code className="font-mono">/events/{initial.slug}</code>
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {isEdit && (
            <Button variant="glass-red" size="icon-medium" onClick={handleDelete} disabled={saving}>
              <TrashIcon className="size-4" />
            </Button>
          )}
          <Button variant="outlined" onClick={() => handleSave("draft")} disabled={saving}>
            <FloppyDiskIcon className="size-4" /> {t("editor.save_draft")}
          </Button>
          <Button onClick={() => handleSave("published")} disabled={saving}>
            <RocketIcon className="size-4" /> {t("editor.publish")}
          </Button>
        </div>
      </div>

      {/* Basics */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4 overflow-visible">
        <h2 className="text-heading-3">{t("editor.event_basics")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field className="md:col-span-2">
            <FieldLabel>{t("editor.field_title")} <span className="text-destructive">*</span></FieldLabel>
            <Input value={form.title} onChange={(e) => update("title", e.target.value)} />
          </Field>
          <Field>
            <FieldLabel>{t("editor.field_slug")}</FieldLabel>
            <Input value={form.slug} onChange={(e) => update("slug", e.target.value)} placeholder="генерируется из названия" />
          </Field>
          <Field>
            <FieldLabel>{t("editor.event_price")}</FieldLabel>
            <Input value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="Бесплатно / 500 ₽" />
          </Field>
          <Field>
            <FieldLabel>{t("editor.event_start")}</FieldLabel>
            <Input type="datetime-local" value={form.start_at} onChange={(e) => update("start_at", e.target.value)} />
          </Field>
          <Field>
            <FieldLabel>{t("editor.event_end")}</FieldLabel>
            <Input type="datetime-local" value={form.end_at} onChange={(e) => update("end_at", e.target.value)} />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel>{t("editor.event_short_desc")}</FieldLabel>
            <Textarea value={form.short_description} onChange={(e) => update("short_description", e.target.value)} className="min-h-[60px]" />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel>{t("editor.event_full_desc")}</FieldLabel>
            <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} className="min-h-[100px]" />
          </Field>
        </div>
      </Card>

      {/* Location */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4 overflow-visible">
        <h2 className="text-heading-3">{t("editor.event_location")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel>{t("editor.event_venue")}</FieldLabel>
            <Input value={form.location_name} onChange={(e) => update("location_name", e.target.value)} placeholder="МЦК КИТС" />
          </Field>
          <Field>
            <FieldLabel>{t("editor.event_city")}</FieldLabel>
            <Input value={form.city} onChange={(e) => update("city", e.target.value)} />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel>{t("editor.event_address")}</FieldLabel>
            <Input value={form.address} onChange={(e) => update("address", e.target.value)} />
          </Field>
          <Field>
            <FieldLabel>{t("editor.event_metro")}</FieldLabel>
            <Input value={form.metro} onChange={(e) => update("metro", e.target.value)} />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel>{t("editor.event_reg_url")}</FieldLabel>
            <Input value={form.registration_url} onChange={(e) => update("registration_url", e.target.value)} placeholder="https://forms.yandex.com/… - если пусто, форма на сайте" />
          </Field>
        </div>

        {/* Dynamic Seat Types */}
        <div className="pt-4 border-t border-(--outline)">
          <div className="flex items-center justify-between mb-3">
            <div>
              <Label className="text-body-3">{t("editor.event_seats_title")}</Label>
              <p className="text-body-5 text-(--on-bg-low)">{t("editor.event_seats_hint")}</p>
            </div>
            <Button type="button" variant="outlined" size="small" onClick={addSeatType}>
              <PlusIcon className="size-4" /> {t("editor.event_add_seat")}
            </Button>
          </div>
          {form.seat_types.length > 0 && (
            <div className="space-y-2">
              {form.seat_types.map((seat, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    value={seat.type}
                    onChange={(e) => updateSeatType(idx, "type", e.target.value)}
                    placeholder={t("editor.event_seat_type_ph")}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={seat.count}
                    onChange={(e) => updateSeatType(idx, "count", e.target.value)}
                    placeholder={t("editor.event_seat_count_ph")}
                    className="w-32"
                  />
                  <Button type="button" variant="text" size="icon-small" onClick={() => removeSeatType(idx)}>
                    <XIcon className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Cover */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <h2 className="text-heading-3">{t("editor.event_cover")}</h2>
        <UnifiedCover
          imageUrl={form.cover_image_src}
          videoUrl={form.cover_video_src}
          onChange={(img, vid) => {
            update("cover_image_src", img);
            update("cover_video_src", vid);
          }}
        />
      </Card>

      {/* Template */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4 overflow-visible">
        <h2 className="text-heading-3">{t("editor.event_custom_page")}</h2>
        <Field>
          <FieldLabel>{t("editor.event_template")}</FieldLabel>
          <Select value={form.custom_page || "__none__"} onValueChange={(v) => update("custom_page", v === "__none__" ? null : v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">{t("editor.event_template_default")}</SelectItem>
              {EVENT_CUSTOM_PAGES_META.map((m) => (
                <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </Card>

      {/* Novel Editor (Replacing MDX) */}
      {!isCustomPage && (
        <div className="space-y-3">
          <h2 className="text-heading-3">{t("editor.section_content")}</h2>
          <NovelEditor
            initialContent={form.content_json}
            onChange={(json) => update("content_json", json)}
          />
        </div>
      )}

      {/* SEO + flags */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <h2 className="text-heading-3">{t("editor.event_flags")}</h2>
        <Field>
          <FieldLabel>{t("editor.field_seo_title")}</FieldLabel>
          <Input value={form.seo_title} onChange={(e) => update("seo_title", e.target.value)} />
        </Field>
        <Field>
          <FieldLabel>{t("editor.field_seo_description")}</FieldLabel>
          <Textarea value={form.meta_description} onChange={(e) => update("meta_description", e.target.value)} className="min-h-[72px]" />
        </Field>
        <div className="flex items-center gap-3 pt-2">
          <Switch id="is_featured" checked={form.is_featured} onCheckedChange={(v) => update("is_featured", v)} />
          <Label htmlFor="is_featured">{t("editor.event_featured")}</Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch id="published" checked={form.publication_status === "published"} onCheckedChange={(v) => update("publication_status", v ? "published" : "draft")} />
          <Label htmlFor="published">{t("editor.status_published")}</Label>
        </div>
      </Card>
    </div>
  );
}
