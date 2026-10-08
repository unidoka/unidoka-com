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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CircleNotchIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { ImageUploadField } from "./image-upload-field";
import { MdxEditor } from "./mdx-editor";
import {
  createSolution, updateSolution,
  type Solution, type SolutionPayload,
} from "@/utils/api/solutions";
import {
  SOLUTION_CUSTOM_PAGES_META,
} from "@/app/solutions/[slug]/_components/solution-custom-pages-meta";

interface Props {
  editing: Solution | null;
  redirectAfter?: string;
}

const NO_CUSTOM_PAGE = "__none__";

export function SolutionEditorForm({ editing, redirectAfter }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<SolutionPayload>({
    title: "",
    slug: "",
    short_description: "",
    description: "",
    mdx_content: "",
    cover_image_src: "",
    cover_video_src: "",
    href: "",
    platform: "",
    category: "",
    period: "",
    tech_stack: [],
    tags: [],
    client_name: "",
    custom_page: null,
    seo_title: "",
    meta_description: "",
    is_featured: false,
    status: "draft",
    sort_order: 0,
  });
  const [techInput, setTechInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!editing) return;
    setForm({
      title: editing.title,
      slug: editing.slug,
      short_description: editing.short_description ?? "",
      description: editing.description ?? "",
      mdx_content: editing.mdx_content ?? "",
      cover_image_src: editing.cover_image_src ?? "",
      cover_video_src: editing.cover_video_src ?? "",
      href: editing.href ?? "",
      platform: editing.platform ?? "",
      category: editing.category ?? "",
      period: editing.period ?? "",
      tech_stack: editing.tech_stack ?? [],
      tags: editing.tags ?? [],
      client_name: editing.client_name ?? "",
      custom_page: editing.custom_page,
      seo_title: editing.seo_title ?? "",
      meta_description: editing.meta_description ?? "",
      is_featured: editing.is_featured,
      status: editing.status,
      sort_order: editing.sort_order,
    });
  }, [editing]);

  const set = <K extends keyof SolutionPayload>(k: K, v: SolutionPayload[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const addTech = () => {
    const v = techInput.trim();
    if (!v) return;
    set("tech_stack", [...(form.tech_stack ?? []), v]);
    setTechInput("");
  };
  const removeTech = (i: number) =>
    set("tech_stack", (form.tech_stack ?? []).filter((_, idx) => idx !== i));

  const addTag = () => {
    const v = tagInput.trim();
    if (!v) return;
    set("tags", [...(form.tags ?? []), { title: v }]);
    setTagInput("");
  };
  const removeTag = (i: number) =>
    set("tags", (form.tags ?? []).filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = "Название обязательно";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const payload: SolutionPayload = {
        ...form,
        title: form.title.trim(),
        slug: form.slug?.trim() || undefined,
        custom_page:
          form.custom_page === NO_CUSTOM_PAGE || !form.custom_page
            ? null
            : form.custom_page,
      };
      if (editing) {
        await updateSolution(editing.slug, payload);
        toast.success("Решение обновлено");
      } else {
        await createSolution(payload);
        toast.success("Решение создано");
      }
      router.push(redirectAfter || "..");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Не удалось сохранить");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-5">
        <h2 className="text-heading-3">Основное</h2>
        <Field data-invalid={!!errors.title}>
          <FieldLabel>Название <span className="text-destructive">*</span></FieldLabel>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
          {errors.title && <FieldError errors={[{ message: errors.title }]} />}
        </Field>
        <Field>
          <FieldLabel>Slug (URL)</FieldLabel>
          <Input
            value={form.slug}
            onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            placeholder="auto-generated from title"
          />
        </Field>
        <Field>
          <FieldLabel>Короткое описание</FieldLabel>
          <Input
            value={form.short_description ?? ""}
            onChange={(e) => set("short_description", e.target.value)}
            placeholder="Одно предложение для карточки"
          />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field>
            <FieldLabel>Категория</FieldLabel>
            <Input
              value={form.category ?? ""}
              onChange={(e) => set("category", e.target.value)}
              placeholder="identity / e-commerce / …"
            />
          </Field>
          <Field>
            <FieldLabel>Период</FieldLabel>
            <Input
              value={form.period ?? ""}
              onChange={(e) => set("period", e.target.value)}
              placeholder="2024"
            />
          </Field>
          <Field>
            <FieldLabel>Платформа</FieldLabel>
            <Input
              value={form.platform ?? ""}
              onChange={(e) => set("platform", e.target.value)}
              placeholder="Web / iOS / …"
            />
          </Field>
        </div>
        <Field>
          <FieldLabel>Внешняя ссылка (Dprofile / кейс)</FieldLabel>
          <Input
            value={form.href ?? ""}
            onChange={(e) => set("href", e.target.value)}
            placeholder="https://dprofile.ru/case/…"
          />
        </Field>
      </Card>

      {/* Cover */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <h2 className="text-heading-3">Обложка</h2>
        <ImageUploadField
          value={form.cover_image_src ?? ""}
          onChange={(url) => set("cover_image_src", url)}
          aspect={16 / 10}
          outputSize={1600}
          variant="cover"
          maxSizeMb={8}
        />
      </Card>

      {/* Custom page selector */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <div>
          <h2 className="text-heading-3">Кастомная страница</h2>
          <p className="text-body-5 text-(--on-bg-low) mt-1">
            Если выбрана кастомная страница, публичный URL /solutions/{form.slug || "slug"} отрендерит её вместо MDX ниже.
          </p>
        </div>
        <Field>
          <FieldLabel>Страница</FieldLabel>
          <Select
            value={form.custom_page ?? NO_CUSTOM_PAGE}
            onValueChange={(v) => set("custom_page", v === NO_CUSTOM_PAGE ? null : v)}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_CUSTOM_PAGE}>— Обычная (MDX) —</SelectItem>
              {SOLUTION_CUSTOM_PAGES_META.map((p) => (
                <SelectItem key={p.key} value={p.key}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.custom_page && (
            <p className="text-body-5 text-(--on-bg-low) mt-1">
              {SOLUTION_CUSTOM_PAGES_META.find((p) => p.key === form.custom_page)?.description}
            </p>
          )}
        </Field>
      </Card>

      {/* MDX */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <h2 className="text-heading-3">Содержимое (MDX)</h2>
        <p className="text-body-5 text-(--on-bg-low)">
          Используется, если кастомная страница не выбрана.
        </p>
        <MdxEditor
          value={form.mdx_content ?? ""}
          onChange={(v) => set("mdx_content", v)}
        />
      </Card>

      {/* Tech + tags */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <h2 className="text-heading-3">Технологии и теги</h2>
        <Field>
          <FieldLabel>Технологии</FieldLabel>
          <div className="flex gap-2">
            <Input value={techInput} onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTech(); } }}
              placeholder="Figma, Next.js, …" />
            <Button type="button" variant="outlined" onClick={addTech}><PlusIcon className="size-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(form.tech_stack ?? []).map((t, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-(--bg) border border-(--outline) px-2.5 py-1 text-body-5">
                {t}
                <button type="button" onClick={() => removeTech(i)} className="text-(--on-bg-low) hover:text-(--error)">
                  <TrashIcon className="size-3" />
                </button>
              </span>
            ))}
          </div>
        </Field>
        <Field>
          <FieldLabel>Теги</FieldLabel>
          <div className="flex gap-2">
            <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
              placeholder="Редизайн, Брендинг, …" />
            <Button type="button" variant="outlined" onClick={addTag}><PlusIcon className="size-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(form.tags ?? []).map((t, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-(--bg) border border-(--outline) px-2.5 py-1 text-body-5">
                {t.title}
                <button type="button" onClick={() => removeTag(i)} className="text-(--on-bg-low) hover:text-(--error)">
                  <TrashIcon className="size-3" />
                </button>
              </span>
            ))}
          </div>
        </Field>
      </Card>

      {/* SEO + Status */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <h2 className="text-heading-3">SEO и статус</h2>
        <Field>
          <FieldLabel>SEO title</FieldLabel>
          <Input value={form.seo_title ?? ""} onChange={(e) => set("seo_title", e.target.value)} />
        </Field>
        <Field>
          <FieldLabel>Meta description</FieldLabel>
          <Textarea
            value={form.meta_description ?? ""}
            onChange={(e) => set("meta_description", e.target.value)}
            className="min-h-[70px]"
          />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Статус</FieldLabel>
            <Select value={form.status} onValueChange={(v) => set("status", v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Черновик</SelectItem>
                <SelectItem value="published">Опубликовано</SelectItem>
                <SelectItem value="archived">В архиве</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={form.is_featured}
                onCheckedChange={(v) => set("is_featured", v === true)}
              />
              <Label className="text-body-4">Избранное</Label>
            </label>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="large" disabled={submitting}>
          {submitting && <CircleNotchIcon className="size-4 animate-spin" />}
          {editing ? "Сохранить изменения" : "Создать решение"}
        </Button>
        <Button type="button" variant="outlined" size="large" onClick={() => router.back()} disabled={submitting}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
