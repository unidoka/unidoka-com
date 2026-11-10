"use client";

import { useState } from "react";
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
import { ImageUploadField } from "./image-upload-field";
import { FloppyDiskIcon, RocketIcon, TrashIcon } from "@phosphor-icons/react";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  submitEvent,
  type EventDetail,
  type EventPayload,
} from "@/utils/api/events";
import { revalidateTags } from "@/utils/revalidate";

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
  is_featured: boolean;
  status: "pending" | "approved" | "rejected";
  mdx_content: string;
  seo_title: string;
  meta_description: string;
}

function isoToLocalInput(iso?: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate(),
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

function toFormState(e?: EventDetail | null): FormState {
  if (!e) {
    return {
      slug: "",
      title: "",
      short_description: "",
      description: "",
      cover_image_src: "",
      cover_video_src: "",
      start_at: "",
      end_at: "",
      location_name: "",
      address: "",
      metro: "",
      city: "Москва",
      price: "Бесплатно",
      registration_url: "",
      is_featured: false,
      status: "pending",
      mdx_content: "",
      seo_title: "",
      meta_description: "",
    };
  }
  return {
    slug: e.slug,
    title: e.title || "",
    short_description: e.short_description || "",
    description: e.description || "",
    cover_image_src: e.cover_image_src || "",
    cover_video_src: e.cover_video_src || "",
    start_at: isoToLocalInput(e.start_at),
    end_at: isoToLocalInput(e.end_at),
    location_name: e.location_name || "",
    address: e.address || "",
    metro: e.metro || "",
    city: e.city || "Москва",
    price: e.price || "",
    registration_url: e.registration_url || "",
    is_featured: e.is_featured || false,
    status: e.status,
    mdx_content: e.mdx_content || "",
    seo_title: e.seo_title || "",
    meta_description: e.meta_description || "",
  };
}

interface Props {
  editing?: EventDetail | null;
  mode?: "admin" | "user";
  redirectAfter?: string;
}

export function EventEditorForm({
  editing = null,
  mode = "admin",
  redirectAfter,
}: Props) {
  const { t } = useLanguage();
  const router = useRouter();
  const isEdit = !!editing;
  const [form, setForm] = useState<FormState>(() => toFormState(editing));
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const buildPayload = (status: "pending" | "approved"): EventPayload => ({
    title: form.title.trim(),
    slug: form.slug.trim() || undefined,
    short_description: form.short_description.trim() || null,
    description: form.description.trim() || null,
    cover_image_src: form.cover_image_src.trim() || null,
    cover_video_src: form.cover_video_src.trim() || null,
    start_at: form.start_at
      ? new Date(form.start_at).toISOString()
      : new Date().toISOString(),
    end_at: form.end_at ? new Date(form.end_at).toISOString() : null,
    location_name: form.location_name.trim() || null,
    address: form.address.trim() || null,
    metro: form.metro.trim() || null,
    city: form.city.trim() || null,
    price: form.price.trim() || null,
    registration_url: form.registration_url.trim() || null,
    is_featured: form.is_featured,
    mdx_content: form.mdx_content.trim() || null,
    seo_title: form.seo_title.trim() || null,
    meta_description: form.meta_description.trim() || null,
    status,
  });

  const handleSave = async (intent: "draft" | "publish") => {
    if (!form.title.trim()) {
      toast.error(t("editor.missing_title"));
      return;
    }
    // Mode drives both the endpoint and the resulting status:
    //   user mode → /events/submit, always pending
    //   admin mode → /admin/events, draft = pending, publish = approved
    const status: "pending" | "approved" =
      mode === "user"
        ? "pending"
        : intent === "publish"
          ? "approved"
          : "pending";
    setSaving(true);
    try {
      const payload = buildPayload(status);
      const saved =
        isEdit && editing
          ? await updateEvent(editing.slug, payload)
          : mode === "user"
            ? await submitEvent(payload)
            : await createEvent(payload);
      toast.success(
        status === "approved"
          ? "Событие опубликовано"
          : mode === "user"
            ? "Отправлено на модерацию"
            : "Черновик сохранён",
      );
      await revalidateTags(["events"]);
      if (redirectAfter) {
        router.push(redirectAfter);
      } else if (!isEdit) {
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
    if (!editing) return;
    if (!confirm(`Удалить событие «${editing.title}»?`)) return;
    setSaving(true);
    try {
      await deleteEvent(editing.slug);
      await revalidateTags(["events"]);
      toast.success("Удалено");
      router.push(redirectAfter || "../");
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
          <h1 className="text-display-2 mb-1">
            {isEdit ? t("editor.event_title_edit") : t("editor.event_title_new")}
          </h1>
          {editing && (
            <p className="text-body-4 text-(--on-bg-low)">
              {editing.status === "approved"
                ? t("editor.status_published")
                : t("editor.status_draft")}{" "}
              · <code className="font-mono">/events/{editing.slug}</code>
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {isEdit && (
            <Button
              variant="glass-red"
              size="icon-medium"
              onClick={handleDelete}
              disabled={saving}
            >
              <TrashIcon className="size-4" />
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={() => handleSave("draft")}
            disabled={saving}
          >
            <FloppyDiskIcon className="size-4" /> {t("editor.save_draft")}
          </Button>
          <Button
            onClick={() => handleSave("publish")}
            disabled={saving}
          >
            <RocketIcon className="size-4" /> {t("editor.publish")}
          </Button>
        </div>
      </div>

      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <h2 className="text-heading-3">{t("editor.event_basics")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field className="md:col-span-2">
            <FieldLabel>
              {t("editor.field_title")}{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>{t("editor.field_slug")}</FieldLabel>
            <Input
              value={form.slug}
              onChange={(e) => update("slug", e.target.value)}
              placeholder="генерируется из названия"
            />
          </Field>
          <Field>
            <FieldLabel>{t("editor.event_price")}</FieldLabel>
            <Input
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              placeholder="Бесплатно / 500 ₽"
            />
          </Field>
          <Field>
            <FieldLabel>{t("editor.event_start")}</FieldLabel>
            <Input
              type="datetime-local"
              value={form.start_at}
              onChange={(e) => update("start_at", e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>{t("editor.event_end")}</FieldLabel>
            <Input
              type="datetime-local"
              value={form.end_at}
              onChange={(e) => update("end_at", e.target.value)}
            />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel>{t("editor.event_short_desc")}</FieldLabel>
            <Textarea
              value={form.short_description}
              onChange={(e) => update("short_description", e.target.value)}
              className="min-h-[60px]"
            />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel>{t("editor.event_full_desc")}</FieldLabel>
            <Textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="min-h-[100px]"
            />
          </Field>
        </div>
      </Card>

      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <h2 className="text-heading-3">{t("editor.event_location")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel>{t("editor.event_venue")}</FieldLabel>
            <Input
              value={form.location_name}
              onChange={(e) => update("location_name", e.target.value)}
              placeholder="МЦК КИТС"
            />
          </Field>
          <Field>
            <FieldLabel>{t("editor.event_city")}</FieldLabel>
            <Input
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
            />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel>{t("editor.event_address")}</FieldLabel>
            <Input
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>{t("editor.event_metro")}</FieldLabel>
            <Input
              value={form.metro}
              onChange={(e) => update("metro", e.target.value)}
            />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel>{t("editor.event_reg_url")}</FieldLabel>
            <Input
              value={form.registration_url}
              onChange={(e) => update("registration_url", e.target.value)}
              placeholder="https://forms.yandex.com/…"
            />
          </Field>
        </div>
      </Card>

      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <h2 className="text-heading-3">{t("editor.event_cover")}</h2>
        <Field>
          <FieldLabel>Cover image</FieldLabel>
          <ImageUploadField
            value={form.cover_image_src}
            onChange={(url) => update("cover_image_src", url)}
            aspect={16 / 9}
            outputSize={1600}
            variant="cover"
          />
        </Field>
        <Field>
          <FieldLabel>Cover video URL (optional)</FieldLabel>
          <Input
            value={form.cover_video_src}
            onChange={(e) => update("cover_video_src", e.target.value)}
            placeholder="https://…"
          />
        </Field>
      </Card>

      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <h2 className="text-heading-3">{t("editor.section_content")}</h2>
        <Field>
          <FieldLabel>MDX content</FieldLabel>
          <Textarea
            value={form.mdx_content}
            onChange={(e) => update("mdx_content", e.target.value)}
            className="min-h-[220px] font-mono text-body-4"
            placeholder="## Заголовок&#10;&#10;Текст в **Markdown**..."
          />
        </Field>
      </Card>

      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <h2 className="text-heading-3">{t("editor.event_flags")}</h2>
        <Field>
          <FieldLabel>{t("editor.field_seo_title")}</FieldLabel>
          <Input
            value={form.seo_title}
            onChange={(e) => update("seo_title", e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel>{t("editor.field_seo_description")}</FieldLabel>
          <Textarea
            value={form.meta_description}
            onChange={(e) => update("meta_description", e.target.value)}
            className="min-h-[72px]"
          />
        </Field>
        <div className="flex items-center gap-3 pt-2">
          <Switch
            id="is_featured"
            checked={form.is_featured}
            onCheckedChange={(v) => update("is_featured", v)}
          />
          <Label htmlFor="is_featured">{t("editor.event_featured")}</Label>
        </div>
      </Card>
    </div>
  );
}
