"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus, ArrowClockwiseIcon,
  PencilSimple, ArrowSquareOutIcon, Newspaper, TrashIcon, DotsThree, RocketIcon,
  Translate,
} from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  fetchAdminArticles, deleteArticle, updateArticle,
  type Article,
} from "@/utils/api/articles";
import { useAdminSecret } from "@/hooks/use-admin-secret";
import { crossSubdomainUrl, rootDomainUrl } from "@/utils/root-domain";
import { revalidateTags } from "@/utils/revalidate";
import { AdminPageHeader } from "../../_components/admin-page-header";
import { AdminFilterBar } from "../../_components/admin-filter-bar";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  published: { label: "Опубликовано", cls: "bg-emerald-500/40 text-white border-white/20" },
  draft: { label: "Черновик", cls: "bg-amber-500/40 text-white border-white/20" },
  archived: { label: "В архиве", cls: "bg-gray-500/40 text-white border-white/20" },
};

export default function AdminArticlesPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const { secret } = useAdminSecret();
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [langFilter, setLangFilter] = useState<string>("all");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (debounced) params.q = debounced;
      if (statusFilter !== "all") params.status = statusFilter;
      if (langFilter !== "all") params.lang = langFilter;
      setItems(await fetchAdminArticles(params));
    } catch (e: any) {
      setError(e?.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [debounced, statusFilter, langFilter]);

  useEffect(() => { if (user) load(); }, [user, load]);

  if (userLoading || !user) return null;
  if (user.role !== "admin" && user.role !== "root") { router.push("/"); return null; }

  const base = crossSubdomainUrl("admin", `/${secret}/articles`);

  const handleDelete = async (a: Article) => {
    if (!confirm(`Удалить статью «${a.title}»?`)) return;
    try {
      await deleteArticle(a.slug);
      await revalidateTags(["articles"]);
      toast.success("Удалено");
      load();
    } catch (e: any) {
      toast.error(e?.message || "Ошибка удаления");
    }
  };

  const handlePublish = async (a: Article) => {
    try {
      await updateArticle(a.slug, { title: a.title, status: "published" });
      await revalidateTags(["articles"]);
      toast.success("Опубликовано");
      load();
    } catch (e: any) {
      toast.error(e?.message || "Ошибка публикации");
    }
  };

  return (
    <CheckUser permission="admin.articles">
      <div className="space-y-6">
        <AdminPageHeader
          title="Статьи"
          meta={loading ? "Загрузка…" : `${items.length} статей`}
          primary={{
            label: "Новая статья",
            href: `${base}/new`,
            icon: Plus,
          }}
          actions={[
            {
              label: "Открыть блог",
              href: rootDomainUrl("/blog"),
              external: true,
              icon: ArrowSquareOutIcon,
            },
            {
              label: "Обновить",
              icon: ArrowClockwiseIcon,
              onClick: load,
            },
          ]}
        />

        <AdminFilterBar
          query={query}
          onQueryChange={setQuery}
          placeholder="Поиск по названию…"
          fields={[
            {
              id: "status",
              label: "Статус",
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: "all", label: "Все" },
                { value: "draft", label: "Черновики" },
                { value: "published", label: "Опубликованные" },
                { value: "archived", label: "В архиве" },
              ],
            },
            {
              id: "lang",
              label: "Язык",
              value: langFilter,
              onChange: setLangFilter,
              options: [
                { value: "all", label: "Все" },
                { value: "ru", label: "Русский" },
                { value: "en", label: "English" },
              ],
            },
          ]}
          onReset={() => {
            setQuery("");
            setStatusFilter("all");
            setLangFilter("all");
          }}
        />

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="rounded-3xl border-(--outline) aspect-[4/3] animate-pulse bg-muted/30" />
            ))}
          </div>
        )}

        {error && (
          <Card className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6">
            <p className="text-body-4 text-(--error) mb-3">{error}</p>
            <Button variant="outlined" size="small" onClick={load}>Повторить</Button>
          </Card>
        )}

        {!loading && !error && items.length === 0 && (
          <Card className="rounded-3xl border-(--outline) p-12 text-center">
            <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-(--primary-card) text-(--primary) mb-4">
              <Newspaper className="size-6" />
            </div>
            <p className="text-body-3 text-(--on-bg-medium) mb-4">Пока нет статей</p>
            <Button asChild><Link href={`${base}/new`}><Plus className="size-4" />Создать</Link></Button>
          </Card>
        )}

        {!loading && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((a) => {
              const meta = STATUS_META[a.status] ?? STATUS_META.draft;
              return (
                <Card
                  key={a.id}
                  className="group relative rounded-3xl border-(--outline) bg-(--card) overflow-hidden transition-all hover:border-(--primary)/40 flex flex-col"
                >
                  <div className="relative aspect-[16/9] bg-muted overflow-hidden">
                    <Link
                      href={`${base}/${a.slug}/edit`}
                      className="absolute inset-0 z-[1]"
                      aria-label={`Редактировать ${a.title}`}
                    />
                    {a.cover_image_src ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={a.cover_image_src}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-(--card)">
                        <span className="select-none font-heading text-display-2 leading-none text-(--on-bg-low)/25">
                          {a.title.trim().charAt(0).toUpperCase() || "—"}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute top-3 left-3 flex gap-1 flex-wrap z-[2]">
                      <Badge variant="glass-static" size="chip-small" className={cn(meta.cls)}>
                        {meta.label}
                      </Badge>
                      <Badge variant="glass-static" size="chip-small" className="text-white border-white/20 uppercase">
                        {a.lang}
                      </Badge>
                      {a.is_featured && (
                        <Badge variant="glass-static" size="chip-small" className="text-white border-white/20">★</Badge>
                      )}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white z-[2] pointer-events-none">
                      <h3 className="text-heading-4 truncate">{a.title}</h3>
                      {a.category && <p className="text-body-5 text-white/70">{a.category}</p>}
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between gap-2 mt-auto">
                    <span className="text-body-5 text-(--on-bg-low) font-mono truncate">/{a.slug}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="outlined" size="small" asChild className="gap-1.5">
                        <Link href={`${base}/${a.slug}/edit`}>
                          <PencilSimple className="size-4" />
                          Редактировать
                        </Link>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="text" size="icon-small" aria-label="Действия">
                            <DotsThree className="size-5" weight="bold" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[190px]">
                          <DropdownMenuItem asChild className="gap-2 px-2 py-2 text-body-4">
                            <Link href={rootDomainUrl(`${a.lang === "en" ? "/en" : ""}/blog/${a.slug}`)} target="_blank" rel="noopener noreferrer">
                              <ArrowSquareOutIcon className="size-4" />
                              Открыть
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="gap-2 px-2 py-2 text-body-4">
                            <Link
                              href={`${base}/new?from=${encodeURIComponent(a.slug)}&lang=${a.lang === "ru" ? "en" : "ru"}`}
                            >
                              <Translate className="size-4" />
                              {a.lang === "ru" ? "English-версия" : "Русская версия"}
                            </Link>
                          </DropdownMenuItem>
                          {a.status !== "published" && (
                            <DropdownMenuItem
                              onSelect={() => handlePublish(a)}
                              className="gap-2 px-2 py-2 text-body-4"
                            >
                              <RocketIcon className="size-4" />
                              Опубликовать
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onSelect={() => handleDelete(a)}
                            className="gap-2 px-2 py-2 text-body-4 text-(--error)"
                          >
                            <TrashIcon className="size-4" />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </CheckUser>
  );
}
