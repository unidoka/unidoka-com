"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { FileTextIcon, DownloadIcon, PhoneIcon, EnvelopeIcon, XIcon, MagnifyingGlassIcon, ArrowClockwiseIcon } from "@phosphor-icons/react";
import { $fetch } from "@/utils/fetch";
import { TelegramLogotypeMonoIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
interface OrderFile { id: string; filename: string; file_path: string; }
type OrderStatus = "new" | "negotiating" | "work" | "done" | "canceled";
interface Order {
  id: string; contact_id: string; service_types_json: string[]; about: string;
  estimate_deadline: string; estimate_budget: string; naming_help: string;
  status: OrderStatus; cancellation_reason: string | null;
  created_at: string; files: OrderFile[];
  contact?: { id: string; name?: string; phone?: string; email?: string; telegram_username?: string; };
}
const STATUS_META: Record<OrderStatus, { label: string; className: string }> = {
  new: { label: "Новая", className: "bg-blue-500/15 text-blue-500 border-blue-500/30" },
  negotiating: { label: "Обсуждение", className: "bg-amber-500/15 text-amber-500 border-amber-500/30" },
  work: { label: "В работе", className: "bg-violet-500/15 text-violet-500 border-violet-500/30" },
  done: { label: "Готово", className: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" },
  canceled: { label: "Отменена", className: "bg-rose-500/15 text-rose-500 border-rose-500/30" },
};
const STATUS_ORDER: OrderStatus[] = ["new", "negotiating", "work", "done", "canceled"];
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg)$/i;
export default function AdminOrdersPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [cancelFor, setCancelFor] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ files: OrderFile[]; index: number } | null>(null);
  const [lightboxApi, setLightboxApi] = useState<CarouselApi>();
  const [lightboxCurrent, setLightboxCurrent] = useState(0);
  useEffect(() => { const t = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 250); return () => clearTimeout(t); }, [query]);
  useEffect(() => {
    if (!lightboxApi || !lightbox) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "ArrowLeft") lightboxApi.scrollPrev(); if (e.key === "ArrowRight") lightboxApi.scrollNext(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxApi, lightbox]);
  useEffect(() => {
    if (!lightboxApi) return;
    const onSelect = () => setLightboxCurrent(lightboxApi.selectedScrollSnap());
    lightboxApi.on("select", onSelect); onSelect();
    return () => { lightboxApi.off("select", onSelect); };
  }, [lightboxApi]);
  useEffect(() => {
    if (!lightboxApi || !lightbox) return;
    const t = setTimeout(() => lightboxApi.scrollTo(lightbox.index, true), 50);
    return () => clearTimeout(t);
  }, [lightboxApi, lightbox]);
  useEffect(() => { if (user) fetchOrders(); }, [user]);
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await $fetch("/api/v1/admin/order-requests", { isToast: false });
      if (res.response?.ok) setOrders(res.json);
      else toast.error("Не удалось загрузить заявки");
    } catch { toast.error("Ошибка загрузки"); }
    finally { setLoading(false); }
  };
  const statusCounts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const s of STATUS_ORDER) c[s] = 0;
    for (const o of orders) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [orders]);
  const filtered = useMemo(() => {
    let list = orders;
    if (statusFilter !== "all") list = list.filter((o) => o.status === statusFilter);
    if (debouncedQuery) {
      const q = debouncedQuery.replace(/^#/, "");
      list = list.filter((o) => {
        const hay = [o.id, o.contact?.name, o.contact?.phone, o.contact?.email, o.contact?.telegram_username].filter(Boolean).join(" ").toLowerCase();
        return hay.includes(q);
      });
    }
    return list;
  }, [orders, statusFilter, debouncedQuery]);
  if (userLoading || !user) return null;
  if (user.role !== "admin" && user.role !== "root") { router.push("/"); return null; }
  const applyStatus = async (order: Order, status: OrderStatus, reason?: string) => {
    setSavingId(order.id);
    try {
      const res = await $fetch(`/api/v1/admin/order-requests/${order.id}`, {
        method: "PATCH", body: JSON.stringify({ status, cancellation_reason: reason ?? null }),
        headers: { "Content-Type": "application/json" }, isToast: false,
      });
      if (!res.response?.ok) { toast.error(res.json?.detail || "Ошибка"); return; }
      const u = res.json as Order;
      setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: u.status, cancellation_reason: u.cancellation_reason } : o));
    } catch { toast.error("Ошибка соединения"); }
    finally { setSavingId(null); }
  };
  const handleStatusChange = (o: Order, next: OrderStatus) => {
    if (next === "canceled") { setCancelFor(o); setCancelReason(""); return; }
    applyStatus(o, next);
  };
  const confirmCancel = async () => {
    if (!cancelFor) return;
    await applyStatus(cancelFor, "canceled", cancelReason.trim() || undefined);
    setCancelFor(null); setCancelReason("");
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-display-2 mb-1">Заявки</h1>
          <p className="text-body-4 text-(--on-bg-medium)">
            {loading ? "Загрузка…" : filtered.length === orders.length ? `${orders.length} заявок` : `${filtered.length} из ${orders.length}`}
          </p>
        </div>
        <Button variant="outlined" size="small" onClick={fetchOrders} disabled={loading}>
          <ArrowClockwiseIcon className={cn("size-4", loading && "animate-spin")} />
          Обновить
        </Button>
      </div>
      {!loading && orders.length > 0 && (
        <Card className="rounded-3xl border-(--outline) p-4 space-y-3">
          <div className="relative">
            <MagnifyingGlassIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-(--on-bg-low) pointer-events-none" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск по ID, имени, телефону, email…" className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusChip label="Все" count={statusCounts.all} active={statusFilter === "all"} onClick={() => setStatusFilter("all")} />
            {STATUS_ORDER.map((s) => <StatusChip key={s} label={STATUS_META[s].label} count={statusCounts[s] ?? 0} active={statusFilter === s} onClick={() => setStatusFilter(s)} />)}
          </div>
        </Card>
      )}
      {loading && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <Card key={i} className="rounded-3xl border-(--outline) h-64 animate-pulse bg-muted/30" />)}</div>}
      {!loading && orders.length === 0 && <Card className="rounded-3xl border-(--outline) p-12 text-center"><p className="text-body-3 text-(--on-bg-medium)">Пока нет заявок</p></Card>}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filtered.map((order) => {
            const meta = STATUS_META[order.status] ?? STATUS_META.new;
            const isSaving = savingId === order.id;
            return (
              <Card key={order.id} className="rounded-3xl border-(--outline) p-6 flex flex-col h-full space-y-3">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="text-heading-4 truncate">#{order.id.slice(0, 8)}</h3>
                    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap", meta.className)}>{meta.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-body-5 text-muted-foreground">Статус:</span>
                  <Select value={order.status} onValueChange={(v) => handleStatusChange(order, v as OrderStatus)} disabled={isSaving}>
                    <SelectTrigger size="sm" className="w-[160px]"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUS_ORDER.map((s) => <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {order.status === "canceled" && order.cancellation_reason && (
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wider text-rose-500/80 mb-0.5">Причина отмены</p>
                    <p className="text-body-4">{order.cancellation_reason}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="font-medium text-body-3">О проекте:</span><p className="text-muted-foreground line-clamp-2">{order.about || "—"}</p></div>
                  <div><span className="font-medium text-body-3">Услуги:</span><p className="text-muted-foreground line-clamp-2">{order.service_types_json?.join(", ") || "—"}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-body-5 space-y-1">
                    <p><span className="font-medium">Срок:</span> {order.estimate_deadline || "—"}</p>
                    <p><span className="font-medium">Бюджет:</span> {order.estimate_budget || "—"}</p>
                    <p><span className="font-medium">Нейминг:</span> {order.naming_help || "—"}</p>
                  </div>
                  <div className="text-body-5 space-y-1">
                    <p><span className="font-medium">Имя:</span> {order.contact?.name || "—"}</p>
                    <div className="flex gap-1 items-center"><PhoneIcon className="size-3" /><p>{order.contact?.phone || "—"}</p></div>
                    <div className="flex gap-1 items-center"><EnvelopeIcon className="size-3" /><p>{order.contact?.email || "—"}</p></div>
                    <div className="flex gap-1 items-center"><TelegramLogotypeMonoIcon className="size-3! [&>path]:fill-(--on-bg-high)" /><p>{order.contact?.telegram_username || "—"}</p></div>
                  </div>
                </div>
                {order.files && order.files.length > 0 && (
                  <Carousel className="w-full mx-auto">
                    <CarouselContent>
                      {order.files.map((file) => {
                        const isImage = IMAGE_EXT.test(file.filename);
                        return (
                          <CarouselItem key={file.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3">
                            <div className="relative flex flex-col items-center border rounded-lg h-28 overflow-hidden bg-muted/20">
                              {isImage ? (
                                <button type="button" onClick={() => {
                                  const imgs = order.files.filter((f) => IMAGE_EXT.test(f.filename));
                                  const idx = imgs.findIndex((f) => f.id === file.id);
                                  setLightbox({ files: imgs, index: Math.max(0, idx) });
                                }} className="relative w-full h-full group">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={file.file_path} alt={file.filename} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                  <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] truncate px-1 py-0.5">{file.filename}</span>
                                </button>
                              ) : (
                                <>
                                  <FileTextIcon className="size-8 aspect-square! text-muted-foreground mt-3" />
                                  <span className="text-[10px] truncate w-full text-center px-1 mt-1">{file.filename}</span>
                                  <a href={file.file_path} target="_blank" rel="noreferrer" className="mt-1"><DownloadIcon className="size-3 text-primary" /></a>
                                </>
                              )}
                            </div>
                          </CarouselItem>
                        );
                      })}
                    </CarouselContent>
                    <CarouselPrevious className="-left-4" />
                    <CarouselNext className="-right-4" />
                  </Carousel>
                )}
                {(order.contact?.telegram_username || order.contact?.phone) && (
                  <div className="mt-4 grid gap-2 grid-cols-2">
                    {order.contact?.telegram_username && (
                      <Button variant="filled" asChild>
                        <Link href={`https://t.me/${order.contact.telegram_username.replace(/^@/, "")}`}>
                          <TelegramLogotypeMonoIcon className="[&>path]:fill-white!" />Telegram
                        </Link>
                      </Button>
                    )}
                    {order.contact?.phone && (
                      <Button variant="filled" asChild>
                        <Link href={`tel:${order.contact.phone}`}><PhoneIcon />Позвонить</Link>
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
      <Dialog open={!!cancelFor} onOpenChange={(open) => { if (!open) { setCancelFor(null); setCancelReason(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Отменить заявку #{cancelFor?.id.slice(0, 8)}</DialogTitle></DialogHeader>
          <Field><FieldLabel>Причина (опционально)</FieldLabel>
            <Textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="min-h-[90px]" /></Field>
          <DialogFooter>
            <Button variant="outlined" onClick={() => { setCancelFor(null); setCancelReason(""); }}>Назад</Button>
            <Button onClick={confirmCancel} disabled={savingId === cancelFor?.id}>Отменить заявку</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!lightbox} onOpenChange={(open) => { if (!open) setLightbox(null); }}>
        <DialogContent showCloseButton={false}
          className="!fixed !inset-0 !top-0 !left-0 !translate-none !max-w-none !max-h-none !w-screen !h-screen !p-0 !border-0 !rounded-none !bg-black/95 flex items-center justify-center">
          <Button variant="glass" size="icon-medium" className="absolute top-4 right-4 z-[60] rounded-full border-white/20" onClick={() => setLightbox(null)}>
            <XIcon className="size-6! text-white" />
          </Button>
          {lightbox && lightbox.files.length > 0 && (
            <Carousel setApi={setLightboxApi} className="w-full h-full">
              <CarouselContent className="h-[100dvh] ml-0">
                {lightbox.files.map((file) => (
                  <CarouselItem key={file.id} className="h-full flex items-center justify-center p-0">
                    <div className="relative w-full h-full flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={file.file_path} alt={file.filename} className="max-w-[92vw] max-h-[92vh] object-contain select-none" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {lightbox.files.length > 1 && (
                <>
                  <CarouselPrevious className="left-6 z-50 bg-white/10 hover:bg-white/20 text-white size-12! border-0" />
                  <CarouselNext className="right-6 z-50 bg-white/10 hover:bg-white/20 text-white size-12! border-0" />
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2">
                    {lightbox.files.map((_, idx) => (
                      <button key={idx} type="button" onClick={() => lightboxApi?.scrollTo(idx)} aria-label={`Slide ${idx + 1}`}
                        className={"h-2 rounded-full transition-all " + (lightboxCurrent === idx ? "w-6 bg-white" : "w-2 bg-white/30 hover:bg-white/50")} />
                    ))}
                  </div>
                </>
              )}
            </Carousel>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
function StatusChip({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <Button size="chip-small" shape="round" variant={active ? "filled" : "tonal-card"} onClick={onClick}>
      {label}
      <span className={cn("ml-1 inline-flex items-center justify-center min-w-[18px] h-4 px-1 text-[10px] font-medium tabular-nums rounded-full",
        active ? "bg-white/25 text-white" : "bg-(--state-hover) text-(--on-bg-low)")}>{count}</span>
    </Button>
  );
}
