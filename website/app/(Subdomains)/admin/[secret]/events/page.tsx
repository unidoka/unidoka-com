"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  ArrowClockwiseIcon,
  PencilSimple,
  ArrowSquareOutIcon,
  CalendarBlank,
  Receipt,
  UserIcon,
  DotsThree,
  ListBullets,
  SquaresFour,
} from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  fetchAdminEvents,
  eventUrl,
  type EventListItem,
} from "@/utils/api/events";
import {
  fetchOrganizersPublic,
  fetchEventTypesPublic,
  type Organizer,
  type EventTypeTaxonomy,
} from "@/utils/api/event-taxonomies";
import { useAdminSecret } from "@/hooks/use-admin-secret";
import { crossSubdomainUrl } from "@/utils/root-domain";
import { AdminPageHeader } from "../../_components/admin-page-header";
import { AdminFilterBar } from "../../_components/admin-filter-bar";

export default function AdminEventsPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const { secret } = useAdminSecret();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [organizerFilter, setOrganizerFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [view, setView] = useState<"list" | "grid">("list");

  // Metadata for filters
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [types, setTypes] = useState<EventTypeTaxonomy[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    Promise.all([fetchOrganizersPublic(), fetchEventTypesPublic()])
      .then(([o, t]) => {
        setOrganizers(o);
        setTypes(t);
      })
      .catch(() => { });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (debouncedQuery) params.q = debouncedQuery;
      if (statusFilter !== "all") params.status = statusFilter;
      if (organizerFilter !== "all") params.organizer_id = organizerFilter;
      if (typeFilter !== "all") params.event_type_id = typeFilter;

      const list = await fetchAdminEvents(params);
      setEvents(list);
    } catch (e: any) {
      setError(e?.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, statusFilter, organizerFilter, typeFilter]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  if (userLoading || !user) return null;
  if (user.role !== "admin" && user.role !== "root") {
    router.push("/");
    return null;
  }

  const base = crossSubdomainUrl("admin", `/${secret}/events`);

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setOrganizerFilter("all");
    setTypeFilter("all");
  };

  const hasActiveFilters =
    query ||
    statusFilter !== "all" ||
    organizerFilter !== "all" ||
    typeFilter !== "all";

  return (
    <CheckUser permission="admin.events">
      <div className="space-y-6">
        <AdminPageHeader
          title="События"
          meta={loading ? "Загрузка…" : `${events.length} событий`}
          primary={{
            label: "Новое событие",
            href: `${base}/new`,
            icon: Plus,
          }}
          actions={[
            {
              label: "Все заявки",
              href: crossSubdomainUrl("admin", `/${secret}/event-requests`),
              icon: Receipt,
            },
            {
              label: "Обновить",
              icon: ArrowClockwiseIcon,
              onClick: load,
            },
          ]}
        />

        {/* Filters */}
        <AdminFilterBar
          query={query}
          onQueryChange={setQuery}
          placeholder="Поиск событий…"
          fields={[
            {
              id: "status",
              label: "Статус",
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: "all", label: "Все" },
                { value: "pending", label: "На модерации" },
                { value: "approved", label: "Опубликовано" },
                { value: "rejected", label: "Отклонено" },
              ],
            },
            {
              id: "organizer",
              label: "Организатор",
              value: organizerFilter,
              onChange: setOrganizerFilter,
              options: [
                { value: "all", label: "Все" },
                ...organizers.map((o) => ({ value: o.id, label: o.name })),
              ],
            },
            {
              id: "type",
              label: "Тип",
              value: typeFilter,
              onChange: setTypeFilter,
              options: [
                { value: "all", label: "Все" },
                ...types.map((t) => ({ value: t.id, label: t.name })),
              ],
            },
          ]}
          onReset={clearFilters}
          trailing={
            <div
              role="group"
              aria-label="Вид списка"
              className="flex items-center rounded-lg border border-(--outline) bg-(--bg) p-0.5"
            >
              <button
                type="button"
                onClick={() => setView("list")}
                aria-pressed={view === "list"}
                aria-label="Списком"
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  view === "list"
                    ? "bg-(--primary) text-(--on-primary)"
                    : "text-(--on-bg-low) hover:text-(--on-bg-high)",
                )}
              >
                <ListBullets className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setView("grid")}
                aria-pressed={view === "grid"}
                aria-label="Плиткой"
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  view === "grid"
                    ? "bg-(--primary) text-(--on-primary)"
                    : "text-(--on-bg-low) hover:text-(--on-bg-high)",
                )}
              >
                <SquaresFour className="size-4" />
              </button>
            </div>
          }
        />

        {/* Content */}
        {loading && view === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card
                key={i}
                className="rounded-3xl border-(--outline) aspect-[4/3] animate-pulse bg-muted/30"
              />
            ))}
          </div>
        )}

        {loading && view === "list" && (
          <Card className="rounded-3xl border-(--outline) divide-y divide-(--outline)">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="h-14 w-20 animate-pulse bg-muted/40" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/2 animate-pulse bg-muted/40" />
                  <div className="h-3 w-1/3 animate-pulse bg-muted/30" />
                </div>
              </div>
            ))}
          </Card>
        )}

        {error && (
          <Card className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6">
            <p className="text-body-4 text-(--error) mb-3">{error}</p>
            <Button variant="outlined" size="small" onClick={load}>
              Повторить
            </Button>
          </Card>
        )}

        {!loading && !error && events.length === 0 && (
          <Card className="rounded-3xl border-(--outline) p-10 text-center">
            <p className="text-body-3 text-(--on-bg-medium) mb-4">
              {hasActiveFilters ? "Ничего не найдено" : "Пока нет событий."}
            </p>
            {!hasActiveFilters && (
              <Button asChild>
                <Link href={`${base}/new`}>
                  <Plus className="size-4" />
                  Создать
                </Link>
              </Button>
            )}
          </Card>
        )}

        {!loading && events.length > 0 && view === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {events.map((ev) => (
              <Card
                key={ev.id}
                className="group relative rounded-3xl border-(--outline) bg-(--card) overflow-hidden transition-all hover:border-(--primary)/40 flex flex-col"
              >
                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                  <Link
                    href={`${base}/${ev.slug}/edit`}
                    className="absolute inset-0 z-[1]"
                    aria-label={`Редактировать ${ev.title}`}
                  />
                  {ev.cover_image_src ? (
                    <Image
                      src={ev.cover_image_src}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-(--primary-glass) to-(--card)" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3 flex gap-1 flex-wrap z-[2]">
                    <Badge
                      variant="glass-static"
                      size="chip-small"
                      className={cn(
                        "text-white border-white/20",
                        ev.status === "approved"
                          ? "bg-emerald-500/40"
                          : ev.status === "rejected"
                            ? "bg-rose-500/40"
                            : "bg-amber-500/40",
                      )}
                    >
                      {ev.status === "approved"
                        ? "Опубликовано"
                        : ev.status === "rejected"
                          ? "Отклонено"
                          : "На модерации"}
                    </Badge>
                    {ev.is_featured && (
                      <Badge
                        variant="glass-static"
                        size="chip-small"
                        className="text-white border-white/20"
                      >
                        ★
                      </Badge>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white z-[2] pointer-events-none">
                    <h3 className="text-heading-4 truncate">{ev.title}</h3>
                    {ev.start_at && (
                      <p className="text-body-5 text-white/70">
                        <CalendarBlank className="size-3 inline mr-1" />
                        {new Date(ev.start_at).toLocaleDateString("ru-RU")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between gap-2 relative z-[2] mt-auto">
                  <div className="text-body-5 text-(--on-bg-low) truncate flex items-center gap-1.5">
                    {ev.submitted_by ? (
                      <>
                        <UserIcon className="size-3.5 shrink-0" />
                        <span className="truncate">
                          {[ev.submitted_by.name, ev.submitted_by.surname]
                            .filter(Boolean)
                            .join(" ") ||
                            ev.submitted_by.username ||
                            "-"}
                        </span>
                      </>
                    ) : (
                      ev.location_name || "-"
                    )}
                  </div>
                  <EventRowActions ev={ev} base={base} />
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && events.length > 0 && view === "list" && (
          <Card className="overflow-hidden rounded-3xl border-(--outline) bg-(--card) divide-y divide-(--outline)">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center gap-3 p-3 transition-colors hover:bg-(--state-hover)"
              >
                <Link
                  href={`${base}/${ev.slug}/edit`}
                  className="relative h-14 w-20 shrink-0 overflow-hidden bg-muted"
                  aria-label={`Редактировать ${ev.title}`}
                >
                  {ev.cover_image_src ? (
                    <Image
                      src={ev.cover_image_src}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-(--primary-glass) to-(--card)" />
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`${base}/${ev.slug}/edit`}
                    className="block truncate text-body-3 text-(--on-bg-high) transition-colors hover:text-(--primary)"
                  >
                    {ev.title}
                  </Link>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-body-5 text-(--on-bg-low)">
                    {ev.start_at && (
                      <span className="inline-flex items-center gap-1">
                        <CalendarBlank className="size-3.5" />
                        {new Date(ev.start_at).toLocaleDateString("ru-RU")}
                      </span>
                    )}
                    {(ev.location_name || ev.submitted_by) && (
                      <span className="inline-flex items-center gap-1 truncate">
                        <UserIcon className="size-3.5 shrink-0" />
                        <span className="truncate">
                          {ev.submitted_by
                            ? [ev.submitted_by.name, ev.submitted_by.surname]
                                .filter(Boolean)
                                .join(" ") ||
                              ev.submitted_by.username ||
                              "-"
                            : ev.location_name}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                <EventStatusBadge ev={ev} />
                <EventRowActions ev={ev} base={base} />
              </div>
            ))}
          </Card>
        )}
      </div>
    </CheckUser>
  );
}

function EventStatusBadge({ ev }: { ev: EventListItem }) {
  const cls =
    ev.status === "approved"
      ? "bg-emerald-500/40"
      : ev.status === "rejected"
        ? "bg-rose-500/40"
        : "bg-amber-500/40";
  const label =
    ev.status === "approved"
      ? "Опубликовано"
      : ev.status === "rejected"
        ? "Отклонено"
        : "На модерации";
  return (
    <Badge variant="glass-static" size="chip-small" className={cn("shrink-0 text-white border-white/20", cls)}>
      {label}
    </Badge>
  );
}

function EventRowActions({ ev, base }: { ev: EventListItem; base: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="text" size="icon-small" aria-label="Действия" className="shrink-0">
          <DotsThree className="size-5" weight="bold" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[190px]">
        <DropdownMenuItem asChild className="gap-2 px-2 py-2 text-body-4">
          <Link href={eventUrl(ev)} target="_blank" rel="noopener noreferrer">
            <ArrowSquareOutIcon className="size-4" />
            Открыть
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="gap-2 px-2 py-2 text-body-4">
          <Link href={`${base}/${ev.slug}/edit`}>
            <PencilSimple className="size-4" />
            Редактировать
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
