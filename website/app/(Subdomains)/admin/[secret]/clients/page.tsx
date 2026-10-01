"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MagnifyingGlassIcon, ArrowClockwiseIcon, CircleNotchIcon, UserIcon, PhoneIcon, EnvelopeSimpleIcon, TelegramLogoIcon, ArrowSquareOutIcon } from "@phosphor-icons/react";
import { $fetch } from "@/utils/fetch";
import { useAdminSecret } from "@/hooks/use-admin-secret";
interface ClientRow {
  id: string; name: string | null; phone: string | null; email: string | null;
  telegram_username: string | null; role_title: string | null;
  order_count: number; last_order_at: string | null; created_at: string;
}
type LoadState = { kind: "loading" } | { kind: "ready"; clients: ClientRow[] } | { kind: "error"; message: string };
export default function AdminClientsPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [query, setQuery] = useState("");
  const { secret } = useAdminSecret();
  const load = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const res = await $fetch("/api/v1/admin/order-requests?limit=500", { isToast: false });
      if (!res?.response?.ok) throw new Error(res?.json?.detail || `HTTP ${res?.response?.status}`);
      const orders = Array.isArray(res.json) ? res.json : [];
      const byClient = new Map<string, ClientRow>();
      for (const o of orders) {
        const c = o.client;
        if (!c?.id) continue;
        const existing = byClient.get(c.id);
        const created = o.created_at || new Date().toISOString();
        if (existing) {
          existing.order_count += 1;
          if (!existing.last_order_at || created > existing.last_order_at) existing.last_order_at = created;
        } else {
          byClient.set(c.id, {
            id: c.id, name: c.name || null, phone: c.phone || null, email: c.email || null,
            telegram_username: c.telegram_username || null, role_title: c.role_title || null,
            order_count: 1, last_order_at: created, created_at: c.created_at || created,
          });
        }
      }
      const list = Array.from(byClient.values()).sort((a, b) => (b.last_order_at || "").localeCompare(a.last_order_at || ""));
      setState({ kind: "ready", clients: list });
    } catch (err: any) {
      setState({ kind: "error", message: err?.message || "Не удалось загрузить клиентов" });
    }
  }, []);
  useEffect(() => { if (user) load(); }, [user, load]);
  if (userLoading || !user) return null;
  if (user.role !== "admin" && user.role !== "root") { router.push("/"); return null; }
  const filtered = useMemo(() => {
    if (state.kind !== "ready") return [];
    const q = query.trim().toLowerCase();
    if (!q) return state.clients;
    return state.clients.filter((c) => [c.name, c.phone, c.email, c.telegram_username].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
  }, [state, query]);
  const clients = state.kind === "ready" ? state.clients : [];
  return (
    <CheckUser>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-display-2 mb-1">Клиенты</h1>
            <p className="text-body-3 text-(--on-bg-medium)">
              {state.kind === "ready" ? `${clients.length} клиентов` : "Загрузка…"}
            </p>
          </div>
          <Button variant="outlined" size="small" onClick={load}>
            {state.kind === "loading" ? <CircleNotchIcon className="size-4 animate-spin" /> : <ArrowClockwiseIcon className="size-4" />}
            Обновить
          </Button>
        </div>
        <Card className="rounded-3xl border-(--outline) p-4">
          <div className="relative">
            <MagnifyingGlassIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-(--on-bg-low) pointer-events-none" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск…" className="pl-9" />
          </div>
        </Card>
        {state.kind === "loading" && <div className="space-y-3">{[...Array(5)].map((_, i) => <Card key={i} className="rounded-3xl border-(--outline) h-24 animate-pulse bg-muted/30" />)}</div>}
        {state.kind === "error" && <Card className="rounded-3xl border border-[color-mix(in_srgb,var(--error),transparent_70%)] bg-[color-mix(in_srgb,var(--error),transparent_96%)] p-6"><p className="text-body-4 text-(--error) mb-3">{state.message}</p><Button variant="outlined" size="small" onClick={load}>Повторить</Button></Card>}
        {state.kind === "ready" && filtered.length === 0 && (
          <Card className="rounded-3xl border-(--outline) p-10 text-center">
            <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-(--primary-card) text-(--primary) mb-4"><UserIcon className="size-6" /></div>
            <p className="text-body-3 text-(--on-bg-medium)">{query ? "Ничего не найдено" : "Клиенты появятся после первой заявки"}</p>
          </Card>
        )}
        {state.kind === "ready" && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((c) => (
              <Card key={c.id} className="rounded-3xl border-(--outline) p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="size-12 shrink-0 rounded-full bg-(--primary-card) flex items-center justify-center text-(--primary) font-medium">
                  {(c.name || "?").trim().slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-heading-4 truncate">{c.name || "Без имени"}</h3>
                    <Badge variant="tonal-card-static" size="chip-small">{c.order_count} заявок</Badge>
                  </div>
                  {c.role_title && <p className="text-body-5 text-(--on-bg-low)">{c.role_title}</p>}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-body-4 text-(--on-bg-medium)">
                    {c.phone && <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1.5 hover:text-(--primary)"><PhoneIcon className="size-3.5" />{c.phone}</a>}
                    {c.email && <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1.5 hover:text-(--primary)"><EnvelopeSimpleIcon className="size-3.5" />{c.email}</a>}
                    {c.telegram_username && <a href={`https://t.me/${c.telegram_username.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-(--primary)"><TelegramLogoIcon className="size-3.5" />@{c.telegram_username.replace(/^@/, "")}</a>}
                  </div>
                </div>
                <Button variant="outlined" size="small" asChild>
                  <Link href={`/admin/${secret || "secret"}/orders`}><ArrowSquareOutIcon className="size-3.5" />Заявки</Link>
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </CheckUser>
  );
}
