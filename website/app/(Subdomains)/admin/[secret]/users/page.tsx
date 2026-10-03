"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  PlusIcon, MagnifyingGlassIcon, ArrowClockwiseIcon,
  PencilSimpleIcon, TrashIcon, UsersIcon, UserMinusIcon,
  RowsIcon, GridFourIcon, EnvelopeSimple, TelegramLogo, PhoneIcon,
  CheckCircleIcon, XCircleIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { $fetch } from "@/utils/fetch";
import { makeTeamMember, removeTeamMember, fetchTeamMembers } from "@/utils/api/team";

interface User {
  id: string; email: string;
  name: string | null; surname: string | null;
  phone: string | null; username: string | null;
  avatar_url: string | null; role: string;
  verified: boolean; blocked: boolean;
  telegram_chat_id?: string | null;
  email_enabled?: boolean;
  telegram_enabled?: boolean;
  receives_order_notifications?: boolean;
}

const ROLE_OPTIONS = [
  { value: "client", label: "Клиент" },
  { value: "user", label: "Пользователь" },
  { value: "admin", label: "Администратор" },
  { value: "root", label: "Супер-администратор" },
];

const ROLE_BADGE: Record<string, string> = {
  root: "bg-violet-500/15 text-violet-500 border-violet-500/30",
  admin: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  user: "bg-gray-500/15 text-gray-500 border-gray-500/30",
  client: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
};

const ROLE_LABEL: Record<string, string> = {
  root: "Root", admin: "Админ", user: "Пользователь", client: "Клиент",
};

type ViewMode = "cards" | "table";

function fullName(u: User): string { return [u.name, u.surname].filter(Boolean).join(" ").trim(); }
function displayName(u: User): string { return fullName(u) || u.username || u.email.split("@")[0] || "Без имени"; }
function initials(u: User): string {
  const full = fullName(u);
  if (full) {
    return full.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
  }
  return (u.email[0] ?? "?").toUpperCase();
}

export default function AdminUsersPage() {
  const { user: currentUser, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("cards");
  const [query, setQuery] = useState("");
  const [teamRoles, setTeamRoles] = useState<Record<string, string>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [teamDialogUser, setTeamDialogUser] = useState<User | null>(null);
  const [teamRole, setTeamRole] = useState("");
  const [teamBio, setTeamBio] = useState("");
  const [teamSaving, setTeamSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, team] = await Promise.all([
        $fetch("/api/v1/admin/users", { isToast: false }),
        fetchTeamMembers().catch(() => []),
      ]);
      if (usersRes.response?.ok) setUsers(usersRes.json as User[]);
      else toast.error("Не удалось загрузить пользователей");
      const lookup: Record<string, string> = {};
      for (const m of team) lookup[m.user_id] = m.role;
      setTeamRoles(lookup);
    } catch {
      toast.error("Ошибка загрузки пользователей");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (currentUser) load(); }, [currentUser, load]);

  if (userLoading || !currentUser) return null;
  if (currentUser.role !== "admin" && currentUser.role !== "root") {
    router.push("/"); return null;
  }

  const isRoot = currentUser.role === "root";
  const canEdit = (u: User) => isRoot || u.role !== "admin";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.email, u.name, u.surname, u.phone, u.username].filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [users, query]);

  const handleDelete = async (u: User) => {
    if (!confirm(`Удалить пользователя ${u.email}?`)) return;
    const res = await $fetch(`/api/v1/admin/users/${u.id}`, { method: "DELETE" });
    if (res.response?.ok) { toast.success("Пользователь удалён"); load(); }
    else toast.error(res.json?.detail || "Ошибка удаления");
  };

  const handleMakeTeamMember = async () => {
    if (!teamDialogUser || !teamRole.trim()) return;
    setTeamSaving(true);
    try {
      await makeTeamMember(teamDialogUser.id, { role: teamRole.trim(), bio: teamBio.trim() || undefined });
      toast.success("Добавлен в команду");
      setTeamDialogUser(null); setTeamRole(""); setTeamBio("");
      load();
    } catch (err: any) { toast.error(err.message || "Ошибка"); }
    finally { setTeamSaving(false); }
  };

  const handleRemoveTeamMember = async (u: User) => {
    if (!confirm("Убрать из команды?")) return;
    try { await removeTeamMember(u.id); toast.success("Убран"); load(); }
    catch (err: any) { toast.error(err.message || "Ошибка"); }
  };

  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (u: User) => { setEditing(u); setDialogOpen(true); };

  return (
    <CheckUser>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-display-2 mb-1">Пользователи</h1>
            <p className="text-body-3 text-(--on-bg-medium)">
              {loading ? "Загрузка…" : query ? `${filtered.length} из ${users.length}` : `${users.length} пользователей`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-0.5 rounded-full border border-(--outline) bg-(--card) p-0.5 h-9">
              {([{ id: "cards", icon: GridFourIcon, label: "Карточки" }, { id: "table", icon: RowsIcon, label: "Таблица" }] as const).map((opt) => {
                const Icon = opt.icon;
                const isActive = view === opt.id;
                return (
                  <button key={opt.id} type="button" onClick={() => setView(opt.id)} title={opt.label}
                    className={cn("inline-flex items-center gap-1.5 rounded-full px-3 h-8 text-xs font-medium transition-colors",
                      isActive ? "bg-(--on-bg-high) text-(--bg)" : "text-(--on-bg-medium) hover:text-(--on-bg-high) hover:bg-(--state-hover)")}>
                    <Icon className="size-3.5" />
                    <span className="hidden sm:inline">{opt.label}</span>
                  </button>
                );
              })}
            </div>
            <Button variant="outlined" size="small" onClick={load} disabled={loading}>
              <ArrowClockwiseIcon className={cn("size-4", loading && "animate-spin")} />
            </Button>
            <Button size="small" onClick={openCreate}>
              <PlusIcon className="size-4" />
              <span className="hidden sm:inline">Добавить</span>
            </Button>
          </div>
        </div>

        {/* Search — bare input, no Card wrapper. The Input component
            already provides its own padding, border, and focus ring.
            Wrapping it added 16px of dead space around a 40px field. */}
        <div className="relative">
          <MagnifyingGlassIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-(--on-bg-low) pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск…"
            className="pl-9 h-11"
          />
        </div>

        {loading && (
          <div className={cn(view === "cards" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-3")}>
            {[...Array(6)].map((_, i) => (
              <Card key={i} className={cn("rounded-3xl border-(--outline) bg-muted/30 animate-pulse", view === "cards" ? "h-44" : "h-16")} />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <Card className="rounded-3xl border-(--outline) p-12 text-center">
            <UsersIcon className="size-6 mx-auto text-(--on-bg-low) mb-3" />
            <p className="text-body-3 text-(--on-bg-medium)">{query ? "Ничего не найдено" : "Пользователей нет"}</p>
          </Card>
        )}

        {!loading && filtered.length > 0 && view === "cards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((u) => (
              <UserCard key={u.id} user={u} teamRole={teamRoles[u.id]}
                canEdit={canEdit(u)} isSelf={u.id === currentUser.id}
                onEdit={() => openEdit(u)} onDelete={() => handleDelete(u)}
                onAddToTeam={() => { setTeamDialogUser(u); setTeamRole(""); setTeamBio(""); }}
                onRemoveFromTeam={() => handleRemoveTeamMember(u)} />
            ))}
          </div>
        )}

        {!loading && filtered.length > 0 && view === "table" && (
          <UserTable users={filtered} teamRoles={teamRoles} currentUserId={currentUser.id}
            canEdit={canEdit} onEdit={openEdit} onDelete={handleDelete}
            onAddToTeam={(u) => { setTeamDialogUser(u); setTeamRole(""); setTeamBio(""); }}
            onRemoveFromTeam={handleRemoveTeamMember} />
        )}
      </div>

      <UserEditorDialog open={dialogOpen} onOpenChange={setDialogOpen} user={editing} isRoot={isRoot} onSaved={load} />

      <Dialog open={!!teamDialogUser} onOpenChange={(open) => { if (!open) setTeamDialogUser(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><UsersIcon className="size-5 text-(--primary)" />Добавить в команду</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            {teamDialogUser && <p className="text-body-4 text-(--on-bg-medium)">Пользователь: <b className="text-(--on-bg-high)">{displayName(teamDialogUser)}</b></p>}
            <Field><FieldLabel>Роль <span className="text-destructive">*</span></FieldLabel>
              <Input value={teamRole} onChange={(e) => setTeamRole(e.target.value)} placeholder="Со-основатель и CTO" /></Field>
            <Field><FieldLabel>Био</FieldLabel>
              <Textarea value={teamBio} onChange={(e) => setTeamBio(e.target.value)} className="min-h-[100px]" /></Field>
          </div>
          <DialogFooter>
            <Button variant="outlined" onClick={() => setTeamDialogUser(null)}>Отмена</Button>
            <Button onClick={handleMakeTeamMember} disabled={!teamRole.trim() || teamSaving}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CheckUser>
  );
}

function UserCard({ user, teamRole, canEdit, isSelf, onEdit, onDelete, onAddToTeam, onRemoveFromTeam }: {
  user: User; teamRole?: string; canEdit: boolean; isSelf: boolean;
  onEdit: () => void; onDelete: () => void; onAddToTeam: () => void; onRemoveFromTeam: () => void;
}) {
  return (
    <Card className={cn("group relative rounded-3xl border border-(--outline) bg-(--card) p-5 flex flex-col gap-4",
      "transition-all hover:border-(--primary)/40 hover:shadow-lg hover:shadow-(--primary)/5")}>
      <div className="flex items-start gap-4">
        <Avatar className="size-14 shrink-0 ring-1 ring-(--outline)">
          {user.avatar_url && <AvatarImage src={user.avatar_url} alt="" />}
          <AvatarFallback className="text-heading-4 font-medium">{initials(user)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-heading-4 truncate">{displayName(user)}</h3>
            {user.verified ? <CheckCircleIcon className="size-3.5 text-emerald-500 shrink-0" weight="fill" /> : <XCircleIcon className="size-3.5 text-(--on-bg-low) shrink-0" />}
          </div>
          {user.username && <p className="text-body-5 text-(--on-bg-low) truncate">@{user.username}</p>}
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            <Badge variant="tonal-card-static" size="chip-small" className={ROLE_BADGE[user.role] ?? ROLE_BADGE.user}>{ROLE_LABEL[user.role] ?? user.role}</Badge>
            {user.blocked && <Badge variant="tonal-card-static" size="chip-small" className="bg-rose-500/15 text-rose-500 border-rose-500/30">Заблокирован</Badge>}
            {teamRole && <Badge variant="tonal-primary-static" size="chip-small">{teamRole}</Badge>}
          </div>
        </div>
      </div>
      <div className="space-y-1.5 text-body-4 text-(--on-bg-medium)">
        <a href={`mailto:${user.email}`} className="flex items-center gap-2 hover:text-(--primary) truncate">
          <EnvelopeSimple className="size-3.5 shrink-0" /><span className="truncate">{user.email}</span>
        </a>
        {user.phone && <a href={`tel:${user.phone}`} className="flex items-center gap-2 hover:text-(--primary)"><PhoneIcon className="size-3.5 shrink-0" /><span>{user.phone}</span></a>}
      </div>
      <div className="flex items-center gap-1.5 flex-wrap pt-1">
        <NotifChip on={user.email_enabled ?? true} icon={<EnvelopeSimple className="size-3" />} label="Email" />
        <NotifChip on={user.telegram_enabled ?? true} icon={<TelegramLogo className="size-3" />} label="TG" />
      </div>
      <div className="flex items-center gap-1 pt-3 border-t border-(--outline) mt-auto">
        <Button variant="text" size="small" onClick={onEdit} disabled={!canEdit}><PencilSimpleIcon className="size-4" />Изменить</Button>
        {teamRole ? (
          <Button variant="text" size="small" onClick={onRemoveFromTeam}><UserMinusIcon className="size-4" /></Button>
        ) : (
          <Button variant="text" size="small" onClick={onAddToTeam}><UsersIcon className="size-4" /></Button>
        )}
        <Button variant="text" size="small" className="ml-auto text-(--error) hover:bg-(--error-card)"
          onClick={onDelete} disabled={!canEdit || isSelf}>
          <TrashIcon className="size-4" />
        </Button>
      </div>
    </Card>
  );
}

function NotifChip({ on, icon, label }: { on: boolean; icon: React.ReactNode; label: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
      on ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
         : "border-(--outline) bg-(--bg) text-(--on-bg-low) line-through")}>
      {icon}{label}
    </span>
  );
}

function UserTable({ users, teamRoles, currentUserId, canEdit, onEdit, onDelete, onAddToTeam, onRemoveFromTeam }: any) {
  return (
    <Card className="rounded-3xl border-(--outline) bg-(--card) overflow-hidden">
      <div className="overflow-x-auto scrollbar-admin">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-(--outline) bg-(--bg)/50">
              <Th>Пользователь</Th><Th>Контакты</Th><Th>Роль</Th><Th>Статус</Th><Th>Уведомления</Th><Th align="right">Действия</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: User) => {
              const editable = canEdit(u);
              const isSelf = u.id === currentUserId;
              const teamRole = teamRoles[u.id];
              return (
                <tr key={u.id} className="border-b border-(--outline)/50 last:border-b-0 hover:bg-(--state-hover) transition-colors">
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 shrink-0 ring-1 ring-(--outline)">
                        {u.avatar_url && <AvatarImage src={u.avatar_url} alt="" />}
                        <AvatarFallback className="text-body-4 font-medium">{initials(u)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-body-3 font-medium truncate">{displayName(u)}</span>
                          {u.verified && <CheckCircleIcon className="size-3 text-emerald-500 shrink-0" weight="fill" />}
                        </div>
                        {u.username && <p className="text-body-5 text-(--on-bg-low) truncate">@{u.username}</p>}
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <div className="space-y-0.5">
                      <p className="text-body-4 text-(--on-bg-medium) truncate max-w-[220px]">{u.email}</p>
                      {u.phone && <p className="text-body-5 text-(--on-bg-low)">{u.phone}</p>}
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="tonal-card-static" size="chip-small" className={ROLE_BADGE[u.role] ?? ROLE_BADGE.user}>{ROLE_LABEL[u.role] ?? u.role}</Badge>
                      {teamRole && <Badge variant="tonal-primary-static" size="chip-small">{teamRole}</Badge>}
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {u.verified ? <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400"><CheckCircleIcon className="size-3" weight="fill" />Подтверждён</span>
                                  : <span className="inline-flex items-center gap-1 text-[11px] text-(--on-bg-low)"><XCircleIcon className="size-3" />Не подтверждён</span>}
                      {u.blocked && <Badge variant="tonal-card-static" size="chip-small" className="bg-rose-500/15 text-rose-500 border-rose-500/30">Блок</Badge>}
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1.5">
                      <NotifChip on={u.email_enabled ?? true} icon={<EnvelopeSimple className="size-3" />} label="Email" />
                      <NotifChip on={u.telegram_enabled ?? true} icon={<TelegramLogo className="size-3" />} label="TG" />
                    </div>
                  </Td>
                  <Td align="right">
                    <div className="flex items-center justify-end gap-0.5">
                      <Button variant="text" size="icon-small" onClick={() => onEdit(u)} disabled={!editable}><PencilSimpleIcon className="size-4" /></Button>
                      {teamRole ? <Button variant="text" size="icon-small" onClick={() => onRemoveFromTeam(u)}><UserMinusIcon className="size-4" /></Button>
                                : <Button variant="text" size="icon-small" onClick={() => onAddToTeam(u)}><UsersIcon className="size-4" /></Button>}
                      <Button variant="text" size="icon-small" className="text-(--error) hover:bg-(--error-card)"
                        onClick={() => onDelete(u)} disabled={!editable || isSelf}><TrashIcon className="size-4" /></Button>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return <th className={cn("px-4 py-3 text-[11px] uppercase tracking-[0.08em] font-medium text-(--on-bg-low) whitespace-nowrap", align === "right" ? "text-right" : "text-left")}>{children}</th>;
}

function Td({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return <td className={cn("px-4 py-3 align-middle", align === "right" ? "text-right" : "text-left")}>{children}</td>;
}

function UserEditorDialog({ open, onOpenChange, user, isRoot, onSaved }: {
  open: boolean; onOpenChange: (o: boolean) => void;
  user: User | null; isRoot: boolean; onSaved: () => void;
}) {
  const isCreate = !user;
  const emptyForm = () => ({
    email: "", password: "", name: "", surname: "", phone: "", username: "",
    avatar_url: "", role: "user", verified: false, blocked: false,
    telegram_chat_id: "", email_enabled: true, telegram_enabled: true,
    receives_order_notifications: false,
  });
  const [form, setForm] = useState<any>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (user) {
      setForm({
        email: user.email, password: "", name: user.name ?? "", surname: user.surname ?? "",
        phone: user.phone ?? "", username: user.username ?? "", avatar_url: user.avatar_url ?? "",
        role: user.role, verified: user.verified, blocked: user.blocked,
        telegram_chat_id: user.telegram_chat_id ?? "",
        email_enabled: user.email_enabled ?? true, telegram_enabled: user.telegram_enabled ?? true,
        receives_order_notifications: user.receives_order_notifications ?? false,
      });
    } else setForm(emptyForm());
    setErrors({});
  }, [open, user]);

  const update = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    const next: Record<string, string> = {};
    if (!form.email.trim()) next.email = "Email обязателен";
    if (isCreate && !form.password) next.password = "Пароль обязателен";
    if (isCreate && form.password && form.password.length < 8) next.password = "Минимум 8 символов";
    if (Object.keys(next).length) { setErrors(next); return; }
    setErrors({}); setSaving(true);
    try {
      let res;
      if (isCreate) {
        res = await $fetch("/api/v1/admin/users", {
          method: "POST", body: JSON.stringify({
            email: form.email.trim(), password: form.password,
            name: form.name.trim() || null, surname: form.surname.trim() || null,
            phone: form.phone.trim() || null, role: form.role,
            verified: form.verified, blocked: form.blocked,
          }), headers: { "Content-Type": "application/json" },
        });
      } else {
        const payload: any = {
          email: form.email.trim(), name: form.name.trim() || null,
          surname: form.surname.trim() || null, phone: form.phone.trim() || null,
          avatar_url: form.avatar_url.trim() || null, role: form.role,
          verified: form.verified, blocked: form.blocked,
          telegram_chat_id: form.telegram_chat_id.trim(),
          email_enabled: form.email_enabled, telegram_enabled: form.telegram_enabled,
        };
        if (form.password) payload.password = form.password;
        res = await $fetch(`/api/v1/admin/users/${user!.id}`, {
          method: "PATCH", body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
        });
      }
      if (res.response?.ok) {
        toast.success(isCreate ? "Создан" : "Обновлён");
        onOpenChange(false); onSaved();
      } else {
        const detail = res.json?.detail;
        if (Array.isArray(detail)) {
          const fe: Record<string, string> = {};
          detail.forEach((e: any) => { if (e.loc && e.loc.length > 1) fe[e.loc[1]] = e.msg; });
          setErrors(fe);
        } else toast.error(detail || "Ошибка");
      }
    } catch { toast.error("Ошибка соединения"); }
    finally { setSaving(false); }
  };

  const roleOptions = isRoot ? ROLE_OPTIONS : ROLE_OPTIONS.filter((o) => o.value !== "root");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto scrollbar-admin p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-(--outline) sticky top-0 bg-(--card) z-10">
          <DialogTitle>{isCreate ? "Новый пользователь" : "Редактирование"}</DialogTitle>
        </DialogHeader>
        <div className="px-6 py-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field className="md:col-span-2" data-invalid={!!errors.email}>
              <FieldLabel>Email <span className="text-destructive">*</span></FieldLabel>
              <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
              {errors.email && <FieldError errors={[{ message: errors.email }]} />}
            </Field>
            <Field><FieldLabel>Имя</FieldLabel><Input value={form.name} onChange={(e) => update("name", e.target.value)} /></Field>
            <Field><FieldLabel>Фамилия</FieldLabel><Input value={form.surname} onChange={(e) => update("surname", e.target.value)} /></Field>
            <Field><FieldLabel>Телефон</FieldLabel><Input value={form.phone} onChange={(e) => update("phone", e.target.value)} /></Field>
            <Field><FieldLabel>Username</FieldLabel>
              <Input value={form.username} onChange={(e) => update("username", e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))} /></Field>
          </div>

          {!isCreate && (
            <div className="space-y-4">
              <h3 className="text-body-5 uppercase tracking-[0.14em] text-(--on-bg-low)">Уведомления</h3>
              <div className="rounded-2xl border border-(--outline) bg-(--bg) p-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-body-4">Email-уведомления</Label>
                  <Switch checked={form.email_enabled} onCheckedChange={(v) => update("email_enabled", v)} />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-body-4">Telegram-уведомления</Label>
                  <Switch checked={form.telegram_enabled} onCheckedChange={(v) => update("telegram_enabled", v)} />
                </div>
                <Field>
                  <FieldLabel className="text-body-5 text-(--on-bg-low)">Telegram Chat ID</FieldLabel>
                  <Input value={form.telegram_chat_id} onChange={(e) => update("telegram_chat_id", e.target.value)} className="font-mono text-body-4" />
                </Field>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field><FieldLabel>Роль</FieldLabel>
              <Select value={form.role} onValueChange={(v) => update("role", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{roleOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select></Field>
            <div className="flex flex-col gap-3 justify-end">
              <label className="flex items-center gap-3 cursor-pointer"><Switch checked={form.verified} onCheckedChange={(v) => update("verified", v)} /><span className="text-body-4">Подтверждён</span></label>
              <label className="flex items-center gap-3 cursor-pointer"><Switch checked={form.blocked} onCheckedChange={(v) => update("blocked", v)} /><span className="text-body-4">Заблокирован</span></label>
              {isRoot && !isCreate && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <Switch
                    checked={!!form.receives_order_notifications}
                    onCheckedChange={(v) => update("receives_order_notifications", v)}
                  />
                  <span className="text-body-4">Уведомления о заявках</span>
                </label>
              )}
            </div>
          </div>

          <Field data-invalid={!!errors.password}>
            <FieldLabel>{isCreate ? "Пароль *" : "Новый пароль"}</FieldLabel>
            <Input type="password" value={form.password} onChange={(e) => update("password", e.target.value)}
              placeholder={isCreate ? "Минимум 8 символов, цифра и заглавная" : "Оставьте пустым"} />
            {errors.password && <FieldError errors={[{ message: errors.password }]} />}
          </Field>
        </div>
        <DialogFooter className="px-6 py-4 border-t border-(--outline) sticky bottom-0 bg-(--card)">
          <Button variant="outlined" onClick={() => onOpenChange(false)} disabled={saving}>Отмена</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Сохранение…" : "Сохранить"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
