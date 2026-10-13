"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowClockwiseIcon,
  CircleNotchIcon,
  PencilSimpleIcon,
  TrashIcon,
  Megaphone,
  ClockIcon,
  CheckCircleIcon,
  PauseCircleIcon,
  HourglassIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  fetchAdminPlacements,
  deletePlacement,
  type MarketingPlacement,
} from "@/utils/api/marketing";
import { PlacementEditorDialog } from "./_components/placement-editor-dialog";

/**
 * Compute the effective status of a placement.
 *
 * Four states the admin actually needs to distinguish:
 *   scheduled  — start_at is in the future
 *   active     — inside the window and is_active=true
 *   expired    — end_at has passed
 *   paused     — is_active=false (outside all time logic)
 *
 * The order matters: paused wins over scheduled/expired, because the
 * admin paused it and that's what they meant regardless of the clock.
 */
type Status = "active" | "scheduled" | "expired" | "paused";

function statusOf(p: MarketingPlacement): Status {
  if (!p.is_active) return "paused";
  const now = Date.now();
  if (p.start_at && new Date(p.start_at).getTime() > now) return "scheduled";
  if (p.end_at && new Date(p.end_at).getTime() < now) return "expired";
  return "active";
}

const STATUS_META: Record<Status, { label: string; className: string; Icon: React.ComponentType<{ className?: string; weight?: "bold" | "regular" }> }> = {
  active: { label: "Активно", className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30", Icon: CheckCircleIcon },
  scheduled: { label: "Запланировано", className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30", Icon: ClockIcon },
  expired: { label: "Завершено", className: "bg-zinc-500/15 text-zinc-500 border-zinc-500/30", Icon: HourglassIcon },
  paused: { label: "На паузе", className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30", Icon: PauseCircleIcon },
};

const TYPE_LABEL: Record<string, string> = {
  top: "Верхняя полоса",
  card: "Карточка",
  toast: "Уведомление",
  dialog: "Окно",
};

export default function AdminPlacementsPage() {
  const { user, isLoading } = useUser();
  const [items, setItems] = useState<MarketingPlacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MarketingPlacement | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (debounced) params.q = debounced;
      if (typeFilter !== "all") params.placement_type = typeFilter;
      setItems(await fetchAdminPlacements(params));
    } catch (e: any) {
      toast.error(e?.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [debounced, typeFilter]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const stats = useMemo(() => {
    const out: Record<Status, number> = { active: 0, scheduled: 0, expired: 0, paused: 0 };
    for (const p of items) out[statusOf(p)]++;
    return out;
  }, [items]);

  if (isLoading || !user) return null;

  const handleDelete = async (p: MarketingPlacement) => {
    if (!confirm(`Удалить размещение «${p.title}»?`)) return;
    try {
      await deletePlacement(p.slug);
      toast.success("Удалено");
      load();
    } catch (e: any) {
      toast.error(e?.message || "Ошибка удаления");
    }
  };

  return (
    <CheckUser>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-display-2 mb-1">Размещения</h1>
            <p className="text-body-3 text-(--on-bg-medium)">
              Кампании в интерфейсе сайта
            </p>
          </div>
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <PlusIcon className="size-4" />
            Новое размещение
          </Button>
        </div>

        {/* Status summary — four counts, not a chart. These are small
            numbers, and the admin reads them once per visit. */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(Object.keys(STATUS_META) as Status[]).map((s) => {
            const meta = STATUS_META[s];
            const Icon = meta.Icon;
            return (
              <Card
                key={s}
                className="rounded-2xl border border-(--outline) bg-(--card) ring-0 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-(--on-bg-low)">
                    {meta.label}
                  </span>
                  <Icon className="size-3.5 text-(--on-bg-low)" weight="regular" />
                </div>
                <p className="font-mono text-[1.5rem] font-semibold leading-none text-(--on-bg-high) tabular-nums">
                  {stats[s]}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Filters.
            Two rows on narrow, one row on sm+. The search box owns its
            row because it's the primary control — the select and
            refresh are secondary and share the second row. The previous
            layout used a single wrapping flex where search had
            min-w-[200px] and the select was fixed at w-[200px]; on a
            content column narrower than ~450px every item wrapped onto
            its own line and the card looked broken. */}
        <Card className="rounded-2xl border-(--outline) p-4">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search — full width on its own row on mobile,
                flex-1 alongside the other controls on sm+. */}
            <div className="relative flex-1 min-w-0">
              <MagnifyingGlassIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-(--on-bg-low) pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по названию…"
                className="pl-9"
              />
            </div>

            {/* Select + refresh. On mobile they stay side-by-side
                (select fills, refresh hugs the right). On desktop the
                pair is a fixed block on the right of the row. */}
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="flex-1 sm:w-[200px] sm:flex-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  <SelectItem value="top">Верхняя полоса</SelectItem>
                  <SelectItem value="card">Карточка</SelectItem>
                  <SelectItem value="toast">Уведомление</SelectItem>
                  <SelectItem value="dialog">Окно</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outlined"
                size="small"
                onClick={load}
                disabled={loading}
                className="shrink-0"
                aria-label="Обновить"
              >
                <ArrowClockwiseIcon
                  className={cn("size-4", loading && "animate-spin")}
                />
              </Button>
            </div>
          </div>
        </Card>

        {loading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="rounded-2xl border-(--outline) h-24 animate-pulse bg-muted/30" />
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <Card className="rounded-2xl border-(--outline) p-12 text-center">
            <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-(--primary-card) text-(--primary) mb-4">
              <Megaphone className="size-6" />
            </div>
            <p className="text-body-3 text-(--on-bg-medium) mb-4">
              {debounced || typeFilter !== "all" ? "Ничего не найдено" : "Пока нет размещений"}
            </p>
            {!debounced && typeFilter === "all" && (
              <Button
                onClick={() => {
                  setEditing(null);
                  setDialogOpen(true);
                }}
              >
                <PlusIcon className="size-4" />
                Создать первое
              </Button>
            )}
          </Card>
        )}

        {!loading && items.length > 0 && (
          <div className="space-y-3">
            {items.map((p) => {
              const status = statusOf(p);
              const meta = STATUS_META[status];
              const StatusIcon = meta.Icon;
              return (
                <Card
                  key={p.id}
                  className="group rounded-2xl border-(--outline) bg-(--card) p-4 sm:p-5"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Preview tile */}
                    {p.image_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={p.image_url}
                        alt=""
                        className="size-16 rounded-xl object-cover shrink-0"
                      />
                    ) : (
                      <span
                        className="size-16 rounded-xl shrink-0 flex items-center justify-center text-body-2 font-semibold"
                        style={{
                          background: p.accent_color
                            ? `color-mix(in srgb, ${p.accent_color} 15%, transparent)`
                            : "var(--primary-card)",
                          color: p.accent_color || "var(--primary)",
                        }}
                      >
                        {TYPE_LABEL[p.placement_type]?.slice(0, 2).toUpperCase() || "—"}
                      </span>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <Badge
                          variant="tonal-card-static"
                          size="chip-small"
                          className={cn("border", meta.className)}
                        >
                          <StatusIcon className="size-3" weight="bold" />
                          {meta.label}
                        </Badge>
                        <Badge variant="tonal-card-static" size="chip-small">
                          {TYPE_LABEL[p.placement_type]}
                        </Badge>
                        <Badge variant="tonal-card-static" size="chip-small">
                          {p.page === "global" ? "Везде" : `/${p.page}`}
                        </Badge>
                        {p.priority > 0 && (
                          <Badge variant="tonal-card-static" size="chip-small">
                            Приоритет {p.priority}
                          </Badge>
                        )}
                        {p.actions.length > 0 && (
                          <Badge variant="tonal-card-static" size="chip-small">
                            {p.actions.length}{" "}
                            {p.actions.length === 1 ? "кнопка" : "кнопки"}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-heading-4 truncate mb-1">{p.title}</h3>
                      {p.heading && (
                        <p className="text-body-4 text-(--on-bg-medium) truncate">
                          {p.heading}
                        </p>
                      )}
                      <p className="text-body-5 text-(--on-bg-low) mt-2 font-mono">
                        /{p.slug}
                        {" · "}
                        <ScheduleSummary p={p} />
                      </p>
                    </div>

                    <div className="flex items-center gap-1 self-start shrink-0">
                      <Button
                        variant="text"
                        size="icon-small"
                        onClick={() => {
                          setEditing(p);
                          setDialogOpen(true);
                        }}
                        aria-label="Редактировать"
                      >
                        <PencilSimpleIcon className="size-4" />
                      </Button>
                      <Button
                        variant="text"
                        size="icon-small"
                        className="text-(--error) hover:bg-(--error-card)"
                        onClick={() => handleDelete(p)}
                        aria-label="Удалить"
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

      <PlacementEditorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSaved={load}
      />
    </CheckUser>
  );
}

/** "01 окт – 15 окт" or "с 01 окт" or "до 15 окт" or "без ограничений" */
function ScheduleSummary({ p }: { p: MarketingPlacement }) {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
    });
  if (!p.start_at && !p.end_at) return <>без ограничений</>;
  if (p.start_at && p.end_at) return <>{fmt(p.start_at)} – {fmt(p.end_at)}</>;
  if (p.start_at) return <>с {fmt(p.start_at)}</>;
  return <>до {fmt(p.end_at!)}</>;
}
