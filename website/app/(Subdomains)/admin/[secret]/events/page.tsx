"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, MagnifyingGlassIcon, ArrowClockwiseIcon, CircleNotchIcon, PencilSimple, ArrowSquareOutIcon, CalendarBlank, Receipt } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { fetchAdminEvents, type EventListItem } from "@/utils/api/events";
import { useAdminSecret } from "@/hooks/use-admin-secret";
export default function AdminEventsPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const { secret } = useAdminSecret();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => { const t = setTimeout(() => setDebounced(query.trim()), 300); return () => clearTimeout(t); }, [query]);
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setEvents(await fetchAdminEvents({ q: debounced || undefined })); }
    catch (e: any) { setError(e?.message || "Ошибка"); }
    finally { setLoading(false); }
  }, [debounced]);
  useEffect(() => { if (user) load(); }, [user, load]);
  if (userLoading || !user) return null;
  if (user.role !== "admin" && user.role !== "root") { router.push("/"); return null; }
  const base = `/admin/${secret}/events`;
  return (
    <CheckUser>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-display-2 mb-1">События</h1>
            <p className="text-body-3 text-(--on-bg-medium)">{loading ? "Загрузка…" : `${events.length} событий`}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outlined" size="small" asChild>
              <Link href={`/admin/${secret}/event-requests`}><Receipt className="size-4" />Все заявки</Link>
            </Button>
            <Button variant="outlined" size="small" onClick={load}>
              {loading ? <CircleNotchIcon className="size-4 animate-spin" /> : <ArrowClockwiseIcon className="size-4" />}Обновить
            </Button>
            <Button asChild><Link href={`${base}/new`}><Plus className="size-4" />Новое событие</Link></Button>
          </div>
        </div>
        <Card className="rounded-3xl border-(--outline) p-4">
          <div className="relative">
            <MagnifyingGlassIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-(--on-bg-low) pointer-events-none" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск…" className="pl-9" />
          </div>
        </Card>
        {loading && <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <Card key={i} className="rounded-3xl border-(--outline) aspect-[16/10] animate-pulse bg-muted/30" />)}</div>}
        {error && <Card className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6"><p className="text-body-4 text-(--error) mb-3">{error}</p><Button variant="outlined" size="small" onClick={load}>Повторить</Button></Card>}
        {!loading && !error && events.length === 0 && <Card className="rounded-3xl border-(--outline) p-10 text-center"><p className="text-body-3 text-(--on-bg-medium) mb-4">Пока нет событий.</p><Button asChild><Link href={`${base}/new`}><Plus className="size-4" />Создать</Link></Button></Card>}
        {!loading && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {events.map((ev) => (
              <Card key={ev.id} className="group relative rounded-3xl border-(--outline) bg-(--card) overflow-hidden transition-all hover:border-(--primary)/40">
                <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                  <Link href={`${base}/${ev.slug}/edit`} className="absolute inset-0 z-[1]" aria-label={`Редактировать ${ev.title}`} />
                  {ev.cover_image_src ? (
                    <Image src={ev.cover_image_src} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : <div className="absolute inset-0 bg-gradient-to-br from-(--primary-glass) to-(--card)" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3 flex gap-1 flex-wrap z-[2]">
                    <Badge variant="glass-static" size="chip-small" className={cn("text-white border-white/20", ev.publication_status === "published" ? "bg-emerald-500/40" : "bg-amber-500/40")}>
                      {ev.publication_status === "published" ? "Опубликовано" : "Черновик"}
                    </Badge>
                    {ev.is_featured && <Badge variant="glass-static" size="chip-small" className="text-white border-white/20">★</Badge>}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white z-[2] pointer-events-none">
                    <h3 className="text-heading-4 truncate">{ev.title}</h3>
                    {ev.start_at && <p className="text-body-5 text-white/70"><CalendarBlank className="size-3 inline mr-1" />{new Date(ev.start_at).toLocaleDateString("ru-RU")}</p>}
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between gap-2 relative z-[2]">
                  <div className="text-body-5 text-(--on-bg-low)">{ev.location_name}</div>
                  <div className="flex gap-1">
                    <Button variant="text" size="icon-small" asChild><Link href={`/events/${ev.slug}`} target="_blank"><ArrowSquareOutIcon className="size-4" /></Link></Button>
                    <Button variant="text" size="icon-small" asChild><Link href={`${base}/${ev.slug}/edit`}><PencilSimple className="size-4" /></Link></Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </CheckUser>
  );
}
