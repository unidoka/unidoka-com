"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CheckUser } from "@/entities/user/model/check-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CircleNotchIcon,
  PlusIcon,
  ArrowSquareOutIcon,
  CalendarBlank,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { fetchMyEventSubmissions, type EventListItem } from "@/utils/api/events";
import { cn } from "@/lib/utils";

const STATUS_META: Record<
  EventListItem["status"],
  { label: string; className: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  pending: {
    label: "На модерации",
    className: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    Icon: ClockIcon,
  },
  approved: {
    label: "Опубликовано",
    className: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    Icon: CheckCircleIcon,
  },
  rejected: {
    label: "Отклонено",
    className: "bg-rose-500/15 text-rose-500 border-rose-500/30",
    Icon: XCircleIcon,
  },
};

export default function MyEventsPage() {
  const [events, setEvents] = useState<EventListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setEvents(await fetchMyEventSubmissions());
    } catch (err: any) {
      setError(err?.message || "Не удалось загрузить заявки");
      setEvents([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <CheckUser>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-display-2 mb-1">Мои события</h1>
            <p className="text-body-3 text-(--on-bg-medium)">
              События, которые вы отправили на модерацию.
            </p>
          </div>
          <Button asChild>
            <Link href="/events/submit">
              <PlusIcon className="size-4" />
              Добавить событие
            </Link>
          </Button>
        </div>

        {events === null && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card
                key={i}
                className="rounded-3xl border-(--outline) h-40 animate-pulse bg-muted/30"
              />
            ))}
          </div>
        )}

        {error && (
          <Card className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6">
            <p className="text-body-4 text-destructive mb-3">{error}</p>
            <Button variant="outlined" size="small" onClick={load}>
              Повторить
            </Button>
          </Card>
        )}

        {events !== null && !error && events.length === 0 && (
          <Card className="rounded-3xl border-(--outline) p-12 text-center">
            <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-(--primary-card) text-(--primary) mb-4">
              <CalendarBlank className="size-6" />
            </div>
            <p className="text-body-3 text-(--on-bg-medium) mb-1">
              Пока нет событий
            </p>
            <p className="text-body-5 text-(--on-bg-low) mb-6">
              Отправьте своё первое событие — после проверки оно появится
              в общем календаре.
            </p>
            <Button asChild>
              <Link href="/events/submit">
                <PlusIcon className="size-4" />
                Добавить событие
              </Link>
            </Button>
          </Card>
        )}

        {events !== null && !error && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((ev) => {
              const meta = STATUS_META[ev.status];
              const Icon = meta.Icon;
              return (
                <Card
                  key={ev.id}
                  className="rounded-3xl border-(--outline) bg-(--card) overflow-hidden"
                >
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="tonal-card-static"
                        size="chip-small"
                        className={cn("border", meta.className)}
                      >
                        <Icon className="size-3" />
                        {meta.label}
                      </Badge>
                      {ev.is_featured && (
                        <Badge variant="tonal-primary-static" size="chip-small">
                          ★ Избранное
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-heading-3 leading-tight line-clamp-2">
                      {ev.title}
                    </h3>
                    {ev.short_description && (
                      <p className="text-body-4 text-(--on-bg-medium) line-clamp-2">
                        {ev.short_description}
                      </p>
                    )}
                    <div className="text-body-5 text-(--on-bg-low) font-mono">
                      /events/{ev.slug}
                    </div>
                  </div>
                  <div className="px-5 pb-5 flex items-center gap-2">
                    {ev.status === "approved" && (
                      <Button variant="outlined" size="small" asChild>
                        <Link
                          href={`/events/${ev.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ArrowSquareOutIcon className="size-4" />
                          Открыть
                        </Link>
                      </Button>
                    )}
                    {ev.status === "rejected" && (
                      <div className="flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2 w-full">
                        <WarningCircleIcon className="size-4 text-rose-500 shrink-0 mt-0.5" />
                        <p className="text-body-5 text-(--on-bg-medium)">
                          Модератор отклонил заявку. Проверьте корректность
                          данных и отправьте заново.
                        </p>
                      </div>
                    )}
                    {ev.status === "pending" && (
                      <p className="text-body-5 text-(--on-bg-low)">
                        Проверка занимает до 1 рабочего дня.
                      </p>
                    )}
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
