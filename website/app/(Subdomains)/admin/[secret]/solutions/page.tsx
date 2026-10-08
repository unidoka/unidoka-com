"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Plus, MagnifyingGlassIcon, ArrowClockwiseIcon, CircleNotchIcon,
  PencilSimple, ArrowSquareOutIcon, Cube, TrashIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  fetchAdminSolutions, deleteSolution,
  type Solution,
} from "@/utils/api/solutions";
import { useAdminSecret } from "@/hooks/use-admin-secret";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  published: { label: "Опубликовано", cls: "bg-emerald-500/40 text-white border-white/20" },
  draft: { label: "Черновик", cls: "bg-amber-500/40 text-white border-white/20" },
  archived: { label: "В архиве", cls: "bg-gray-500/40 text-white border-white/20" },
};

export default function AdminSolutionsPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const { secret } = useAdminSecret();
  const [items, setItems] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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
      setItems(await fetchAdminSolutions(params));
    } catch (e: any) {
      setError(e?.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [debounced, statusFilter]);

  useEffect(() => { if (user) load(); }, [user, load]);

  if (userLoading || !user) return null;
  if (user.role !== "admin" && user.role !== "root") { router.push("/"); return null; }

  const base = `/admin/${secret}/solutions`;

  const handleDelete = async (s: Solution) => {
    if (!confirm(`Удалить решение «${s.title}»?`)) return;
    try {
      await deleteSolution(s.slug);
      toast.success("Удалено");
      load();
    } catch (e: any) {
      toast.error(e?.message || "Ошибка удаления");
    }
  };

  return (
    <CheckUser>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-display-2 mb-1">Решения</h1>
            <p className="text-body-3 text-(--on-bg-medium)">
              {loading ? "Загрузка…" : `${items.length} решений`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outlined" size="small" asChild>
              <Link href="/projects" target="_blank">
                <ArrowSquareOutIcon className="size-4" />
                Открыть на сайте
              </Link>
            </Button>
            <Button variant="outlined" size="small" onClick={load} disabled={loading}>
              {loading ? <CircleNotchIcon className="size-4 animate-spin" /> : <ArrowClockwiseIcon className="size-4" />}
              Обновить
            </Button>
            <Button asChild>
              <Link href={`${base}/new`}>
                <Plus className="size-4" />
                Новое решение
              </Link>
            </Button>
          </div>
        </div>

        <Card className="rounded-3xl border-(--outline) p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <MagnifyingGlassIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-(--on-bg-low) pointer-events-none" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск…" className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="draft">Черновики</SelectItem>
                <SelectItem value="published">Опубликованные</SelectItem>
                <SelectItem value="archived">В архиве</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="rounded-3xl border-(--outline) aspect-[16/10] animate-pulse bg-muted/30" />
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
              <Cube className="size-6" />
            </div>
            <p className="text-body-3 text-(--on-bg-medium) mb-4">Пока нет решений</p>
            <Button asChild><Link href={`${base}/new`}><Plus className="size-4" />Создать</Link></Button>
          </Card>
        )}

        {!loading && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((s) => {
              const meta = STATUS_META[s.status] ?? STATUS_META.draft;
              return (
                <Card
                  key={s.id}
                  className="group relative rounded-3xl border-(--outline) bg-(--card) overflow-hidden transition-all hover:border-(--primary)/40 flex flex-col"
                >
                  <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                    <Link
                      href={`${base}/${s.slug}/edit`}
                      className="absolute inset-0 z-[1]"
                      aria-label={`Редактировать ${s.title}`}
                    />
                    {s.cover_image_src ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={s.cover_image_src}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-(--primary-glass) to-(--card)" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute top-3 left-3 flex gap-1 flex-wrap z-[2]">
                      <Badge variant="glass-static" size="chip-small" className={cn(meta.cls)}>
                        {meta.label}
                      </Badge>
                      {s.is_featured && (
                        <Badge variant="glass-static" size="chip-small" className="text-white border-white/20">★</Badge>
                      )}
                      {s.custom_page && (
                        <Badge variant="glass-static" size="chip-small" className="text-white border-white/20">
                          custom: {s.custom_page}
                        </Badge>
                      )}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white z-[2] pointer-events-none">
                      <h3 className="text-heading-4 truncate">{s.title}</h3>
                      {s.period && <p className="text-body-5 text-white/70">{s.period}</p>}
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between gap-2 mt-auto">
                    <span className="text-body-5 text-(--on-bg-low) font-mono truncate">/{s.slug}</span>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="text" size="icon-small" asChild>
                        <Link href={`/solutions/${s.slug}`} target="_blank">
                          <ArrowSquareOutIcon className="size-4" />
                        </Link>
                      </Button>
                      <Button variant="text" size="icon-small" asChild>
                        <Link href={`${base}/${s.slug}/edit`}>
                          <PencilSimple className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="text"
                        size="icon-small"
                        className="text-(--error)"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(s); }}
                      >
                        <TrashIcon className="size-4" />
                      </Button>
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
