"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowSquareOutIcon, ArrowClockwiseIcon, CircleNotchIcon, Buildings, Plus, PencilSimple, Trash } from "@phosphor-icons/react";
import { fetchCompanies, deleteCompany, type ClientListItem } from "@/utils/api/companies";
import { CompanyEditorDialog } from "./_components/company-editor-dialog";
type LoadState = { kind: "loading" } | { kind: "ready"; clients: ClientListItem[] } | { kind: "error"; message: string };
function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}
export default function AdminCompaniesPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ClientListItem | null>(null);
  const load = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const clients = await fetchCompanies();
      setState({ kind: "ready", clients });
    } catch (err: any) { setState({ kind: "error", message: err?.message || "Ошибка" }); }
  }, []);
  useEffect(() => { if (user) load(); }, [user, load]);
  if (userLoading || !user) return null;
  if (user.role !== "admin" && user.role !== "root") { router.push("/"); return null; }
  const handleDelete = async (c: ClientListItem) => {
    if (!confirm(`Удалить компанию «${c.name}»?`)) return;
    try { await deleteCompany(c.id); toast.success("Удалено"); load(); }
    catch (err: any) { toast.error(err?.message || "Ошибка"); }
  };
  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (c: ClientListItem) => { setEditing(c); setDialogOpen(true); };
  const clients = state.kind === "ready" ? state.clients : [];
  return (
    <CheckUser>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-display-2 mb-1">Компании</h1>
            <p className="text-body-3 text-(--on-bg-medium)">{state.kind === "ready" ? `${clients.length} компаний` : "Загрузка…"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outlined" size="small" onClick={load}>
              {state.kind === "loading" ? <CircleNotchIcon className="size-4 animate-spin" /> : <ArrowClockwiseIcon className="size-4" />}
              Обновить
            </Button>
            <Button onClick={openCreate}><Plus className="size-4" />Новый клиент</Button>
          </div>
        </div>
        {state.kind === "loading" && <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">{[...Array(8)].map((_, i) => <Card key={i} className="rounded-3xl border-(--outline) aspect-square animate-pulse bg-muted/30" />)}</div>}
        {state.kind === "error" && <Card className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6"><p className="text-body-4 text-destructive mb-3">{state.message}</p><Button variant="outlined" size="small" onClick={load}>Повторить</Button></Card>}
        {state.kind === "ready" && clients.length === 0 && (
          <Card className="rounded-3xl border-(--outline) p-10 text-center">
            <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-(--primary-card) text-(--primary) mb-4"><Buildings className="size-6" /></div>
            <p className="text-body-3 text-(--on-bg-medium) mb-4">Пока нет компаний.</p>
            <Button onClick={openCreate}><Plus className="size-4" />Добавить</Button>
          </Card>
        )}
        {state.kind === "ready" && clients.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {clients.map((c) => (
              <Card key={c.id} className="group relative aspect-square rounded-3xl border-(--outline) bg-(--card) overflow-hidden transition-all hover:border-(--primary)/40 cursor-pointer" onClick={() => openEdit(c)}>
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  {c.logotype_url ? (
                    <div className="relative w-full h-full">
                      <Image src={c.logotype_url} alt={c.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-contain p-2" />
                    </div>
                  ) : (
                    <span className="text-display-2 font-heading font-semibold tracking-tighter text-(--on-bg-high) opacity-40">{initials(c.name)}</span>
                  )}
                </div>
                {c.industry && <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest text-(--on-bg-low)">{c.industry}</span>}
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-body-3 font-medium text-white truncate">{c.name}</p>
                  <p className="text-body-6 text-white/70 font-mono truncate">/companies/{c.slug}</p>
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="glass" size="icon-small" asChild title="Открыть" onClick={(e) => e.stopPropagation()}>
                    <Link href={`/companies/${c.slug}`} target="_blank"><ArrowSquareOutIcon className="size-3.5" /></Link>
                  </Button>
                  <Button variant="glass" size="icon-small" title="Редактировать" onClick={(e) => { e.stopPropagation(); openEdit(c); }}><PencilSimple className="size-3.5" /></Button>
                  <Button variant="glass" size="icon-small" title="Удалить" onClick={(e) => { e.stopPropagation(); handleDelete(c); }}><Trash className="size-3.5" /></Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <CompanyEditorDialog client={editing} open={dialogOpen} onOpenChange={setDialogOpen} onSaved={load} />
    </CheckUser>
  );
}
