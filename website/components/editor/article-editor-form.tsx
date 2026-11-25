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
import { CircleNotchIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import {
  createArticle,
  updateArticle,
  type Article,
} from "@/utils/api/articles";
import { NovelEditor } from "./novel/novel-editor";
import { UnifiedCover } from "./unified-cover";
import { revalidateTags } from "@/utils/revalidate";

interface Props {
  editing: Article | null;
  redirectAfter?: string;
  /** Prefill for a new article, e.g. the source of a translation. */
  template?: Article | null;
}

// NovelEditor reads initialContent only on mount, so form state must already
// contain the fetched article on the first render.
function formFromArticle(editing: Article | null) {
  return {
    title: editing?.title ?? "",
    slug: editing?.slug ?? "",
    description: editing?.description ?? "",
    content_json: editing?.content_json ?? null,
    lang: editing?.lang ?? "ru",
    translation_group_id: editing?.translation_group_id ?? null,
    cover_image_src: editing?.cover_image_src ?? "",
    cover_video_src: editing?.cover_video_src ?? "",
    category: editing?.category ?? "",
    tags: editing?.tags ?? [],
    author_name: editing?.author_name ?? "",
    author_avatar_url: editing?.author_avatar_url ?? "",
    is_team_author: editing?.is_team_author ?? true,
    seo_title: editing?.seo_title ?? "",
    meta_description: editing?.meta_description ?? "",
    is_featured: editing?.is_featured ?? false,
    status: editing?.status ?? "published",
    sort_order: editing?.sort_order ?? 0,
  };
}

export function ArticleEditorForm({ editing, redirectAfter, template }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<any>(() =>
    formFromArticle(editing ?? template ?? null),
  );
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!editing && !template) return;
    setForm(formFromArticle(editing ?? template ?? null));
  }, [editing, template]);

  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const addTag = () => {
    const v = tagInput.trim();
    if (!v) return;
    set("tags", [...(form.tags ?? []), { title: v }]);
    setTagInput("");
  };
  const removeTag = (i: number) =>
    set("tags", (form.tags ?? []).filter((_: any, idx: number) => idx !== i));

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
      const payload: any = {
        ...form,
        title: form.title.trim(),
        slug: form.slug?.trim() || undefined,
      };
      if (editing) {
        await updateArticle(editing.slug, payload);
        toast.success("Статья обновлена");
      } else {
        await createArticle(payload);
        toast.success("Статья создана");
      }
      await revalidateTags(["articles"]);
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
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-5">
        <h2 className="text-heading-3">Основное</h2>
        <Field data-invalid={!!errors.title}>
          <FieldLabel>
            Название <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
          {errors.title && <FieldError errors={[{ message: errors.title }]} />}
        </Field>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_180px]">
          <Field>
            <FieldLabel>Slug (URL)</FieldLabel>
            <Input
              value={form.slug}
              onChange={(e) =>
                set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
              }
              placeholder="auto-generated from title"
            />
          </Field>
          <Field>
            <FieldLabel>Язык</FieldLabel>
            <Select value={form.lang} onValueChange={(v) => set("lang", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ru">Русский</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field>
          <FieldLabel>Короткое описание</FieldLabel>
          <Textarea
            value={form.description ?? ""}
            onChange={(e) => set("description", e.target.value)}
            className="min-h-[80px]"
          />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Категория</FieldLabel>
            <Input
              value={form.category ?? ""}
              onChange={(e) => set("category", e.target.value)}
              placeholder="design / engineering / …"
            />
          </Field>
          <Field>
            <FieldLabel>Автор</FieldLabel>
            <Input
              value={form.author_name ?? ""}
              onChange={(e) => set("author_name", e.target.value)}
            />
          </Field>
        </div>
        <Field>
          <FieldLabel>Аватар автора</FieldLabel>
          <Input
            value={form.author_avatar_url ?? ""}
            onChange={(e) => set("author_avatar_url", e.target.value)}
            placeholder="https://…"
          />
        </Field>
      </Card>

      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <h2 className="text-heading-3">Обложка</h2>
        <UnifiedCover
          imageUrl={form.cover_image_src ?? ""}
          videoUrl={form.cover_video_src ?? ""}
          onChange={(img, vid) => {
            set("cover_image_src", img);
            set("cover_video_src", vid || null);
          }}
        />
      </Card>

      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <h2 className="text-heading-3">Контент</h2>
        <Field>
          <FieldLabel>Текст статьи (Novel Editor)</FieldLabel>
          <NovelEditor
            initialContent={form.content_json}
            onChange={(json) => set("content_json", json)}
            className="min-h-[500px] rounded-2xl border border-(--outline) bg-(--card)"
          />
        </Field>
      </Card>

      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <h2 className="text-heading-3">Теги</h2>
        <Field>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="UX, UI, …"
            />
            <Button type="button" variant="outlined" onClick={addTag}>
              <PlusIcon className="size-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(form.tags ?? []).map((t: any, i: number) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-(--bg) border border-(--outline) px-3 py-1 text-body-5 text-(--on-bg-medium)"
              >
                {t.title}
                <button
                  type="button"
                  onClick={() => removeTag(i)}
                  className="text-(--on-bg-low) hover:text-destructive"
                >
                  <TrashIcon className="size-3" />
                </button>
              </span>
            ))}
          </div>
        </Field>
      </Card>

      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <h2 className="text-heading-3">SEO и флаги</h2>
        <Field>
          <FieldLabel>SEO Title</FieldLabel>
          <Input
            value={form.seo_title ?? ""}
            onChange={(e) => set("seo_title", e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel>SEO Description</FieldLabel>
          <Textarea
            value={form.meta_description ?? ""}
            onChange={(e) => set("meta_description", e.target.value)}
            className="min-h-[80px]"
          />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Статус</FieldLabel>
            <Select
              value={form.status}
              onValueChange={(v) =>
                set("status", v as "draft" | "published" | "archived")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Черновик</SelectItem>
                <SelectItem value="published">Опубликовано</SelectItem>
                <SelectItem value="archived">В архиве</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-body-5 text-(--on-bg-low) mt-1">
              Скрыть с сайта можно статусом «В архиве».
            </p>
          </Field>
          <Field>
            <FieldLabel>Порядок сортировки</FieldLabel>
            <Input
              type="number"
              value={form.sort_order ?? 0}
              onChange={(e) => set("sort_order", Number(e.target.value))}
            />
          </Field>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="article_is_featured"
            checked={form.is_featured}
            onCheckedChange={(v) => set("is_featured", !!v)}
          />
          <Label htmlFor="article_is_featured">Рекомендуемая статья</Label>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting && <CircleNotchIcon className="size-4 animate-spin" />}
          {editing ? "Сохранить" : "Создать"}
        </Button>
      </div>
    </form>
  );
}
