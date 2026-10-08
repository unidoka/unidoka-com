"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  ArrowClockwiseIcon,
  CheckCircleIcon,
  XCircleIcon,
  CircleNotchIcon,
  CalendarBlankIcon,
  MapPinIcon,
  ArrowSquareOutIcon,
  UserIcon,
} from "@phosphor-icons/react";
import {
  fetchAdminEvents,
  approveEvent,
  rejectEvent,
  type EventListItem,
} from "@/utils/api/events";
import { useAdminSecret } from "@/hooks/use-admin-secret";

export default function AdminEventRequestsPage() {
  const { user, isLoading: userLoading } = useUser();
  const { secret } = useAdminSecret();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Состояние для диалога отклонения
  const [rejecting, setRejecting] = useState<EventListItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchAdminEvents({ status: "pending" });
      setEvents(list);
    } catch (err: any) {
      setError(err?.message || "Не удалось загрузить заявки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  if (userLoading || !user) return null;
  if (user.role !== "admin" && user.role !== "root") return null;

  const handleApprove = async (ev: EventListItem) => {
    setSavingId(ev.id);
    try {
      await approveEvent(ev.slug);
      toast.success(`Событие «${ev.title}» одобрено`);
      setEvents((prev) => prev.filter((e) => e.id !== ev.id));
    } catch (err: any) {
      toast.error(err?.message || "Ошибка одобрения");
    } finally {
      setSavingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejecting) return;
    if (!rejectReason.trim()) {
      toast.error("Укажите причину отклонения");
      return;
    }
    setSavingId(rejecting.id);
    try {
      await rejectEvent(rejecting.slug, rejectReason.trim());
      toast.success(`Событие «${rejecting.title}» отклонено`);
      setEvents((prev) => prev.filter((e) => e.id !== rejecting.id));
      setRejecting(null);
      setRejectReason("");
    } catch (err: any) {
      toast.error(err?.message || "Ошибка отклонения");
    } finally {
      setSavingId(null);
    }
  };

  const base = `/admin/${secret}`;

  return (
    <CheckUser>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-display-2 mb-1">Заявки на события</h1>
            <p className="text-body-3 text-(--on-bg-medium)">
              {loading
                ? "Загрузка…"
                : `${events.length} заявок на модерации`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outlined" size="small" onClick={load} disabled={loading}>
              {loading ? (
                <CircleNotchIcon className="size-4 animate-spin" />
              ) : (
                <ArrowClockwiseIcon className="size-4" />
              )}
              Обновить
            </Button>
            <Button asChild size="small">
              <Link href={`${base}/events`}>
                <CalendarBlankIcon className="size-4" />
                Все события
              </Link>
            </Button>
          </div>
        </div>

        {loading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Card
                key={i}
                className="rounded-3xl border-(--outline) h-32 animate-pulse bg-muted/30"
              />
            ))}
          </div>
        )}

        {error && (
          <Card className="rounded-3xl border border-rose-500/30 bg-rose-500/5 p-6">
            <p className="text-body-4 text-rose-500 mb-3">{error}</p>
            <Button variant="outlined" size="small" onClick={load}>
              Повторить
            </Button>
          </Card>
        )}

        {!loading && !error && events.length === 0 && (
          <Card className="rounded-3xl border-(--outline) p-12 text-center">
            <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-(--primary-card) text-(--primary) mb-4">
              <CheckCircleIcon className="size-6" />
            </div>
            <h3 className="text-heading-3 mb-1">Нет заявок на модерации</h3>
            <p className="text-body-4 text-(--on-bg-medium)">
              Все события проверены. Новые появятся здесь, когда пользователи их отправят.
            </p>
          </Card>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="space-y-4">
            {events.map((ev) => (
              <Card
                key={ev.id}
                className="rounded-3xl border-(--outline) bg-(--card) overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Обложка */}
                  {ev.cover_image_src && (
                    <div className="relative w-full md:w-48 h-40 md:h-auto shrink-0 bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ev.cover_image_src}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Контент */}
                  <div className="flex-1 p-5 md:p-6 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="tonal-card-static" size="chip-small" className="bg-amber-500/15 text-amber-500 border-amber-500/30">
                        На модерации
                      </Badge>
                      {ev.organizer && (
                        <Badge variant="tonal-card-static" size="chip-small">
                          {ev.organizer.name}
                        </Badge>
                      )}
                      {ev.custom_organizer_name && (
                        <Badge variant="tonal-card-static" size="chip-small">
                          {ev.custom_organizer_name}
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-heading-3 leading-tight">{ev.title}</h3>

                    {ev.short_description && (
                      <p className="text-body-4 text-(--on-bg-medium) line-clamp-2">
                        {ev.short_description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-body-5 text-(--on-bg-low)">
                      {ev.start_at && (
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarBlankIcon className="size-3.5" />
                          {new Date(ev.start_at).toLocaleDateString("ru-RU")}
                        </span>
                      )}
                      {ev.location_name && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPinIcon className="size-3.5" />
                          {ev.location_name}
                        </span>
                      )}
                      {ev.submitted_by && (
                        <span className="inline-flex items-center gap-1.5">
                          <UserIcon className="size-3.5" />
                          {[ev.submitted_by.name, ev.submitted_by.surname].filter(Boolean).join(" ") || ev.submitted_by.username || "—"}
                        </span>
                      )}
                    </div>

                    {/* Действия */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-(--outline)">
                      <Button
                        size="small"
                        variant="filled"
                        onClick={() => handleApprove(ev)}
                        disabled={savingId === ev.id}
                      >
                        {savingId === ev.id ? (
                          <CircleNotchIcon className="size-4 animate-spin" />
                        ) : (
                          <CheckCircleIcon className="size-4" />
                        )}
                        Одобрить
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        className="text-rose-500 border-rose-500/30 hover:bg-rose-500/10"
                        onClick={() => {
                          setRejecting(ev);
                          setRejectReason("");
                        }}
                        disabled={savingId === ev.id}
                      >
                        <XCircleIcon className="size-4" />
                        Отклонить
                      </Button>
                      <Button size="small" variant="text" asChild className="ml-auto">
                        <Link href={`/events/${ev.slug}`} target="_blank">
                          <ArrowSquareOutIcon className="size-4" />
                          Открыть
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Диалог отклонения */}
      <Dialog
        open={!!rejecting}
        onOpenChange={(open) => {
          if (!open) {
            setRejecting(null);
            setRejectReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Отклонить событие</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {rejecting && (
              <p className="text-body-4 text-(--on-bg-medium)">
                Событие: <b className="text-(--on-bg-high)">{rejecting.title}</b>
              </p>
            )}
            <Field>
              <FieldLabel>Причина отклонения *</FieldLabel>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Например: неполное описание, неверная дата..."
                className="min-h-[90px]"
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outlined" onClick={() => setRejecting(null)} disabled={savingId === rejecting?.id}>
              Отмена
            </Button>
            <Button
              onClick={handleReject}
              disabled={savingId === rejecting?.id || !rejectReason.trim()}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              {savingId === rejecting?.id ? (
                <CircleNotchIcon className="size-4 animate-spin" />
              ) : (
                <XCircleIcon className="size-4" />
              )}
              Отклонить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CheckUser>
  );
}
