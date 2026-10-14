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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { SettingRow } from "@/components/ui/setting-row";
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
  ShieldCheck, EnvelopeOpen, CalendarBlank, Trophy, Megaphone,
  Newspaper, Briefcase,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { $fetch } from "@/utils/fetch";
import { makeTeamMember, removeTeamMember, fetchTeamMembers } from "@/utils/api/team";
import { ADMIN_PERMISSIONS } from "@/utils/permissions";
import { USER_TOPICS } from "@/entities/i18n/notifications";

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */

interface User {
  id: string;
  email: string;
  name: string | null;
  surname: string | null;
  phone: string | null;
  username: string | null;
  avatar_url: string | null;
  role: string;
  verified: boolean;
  blocked: boolean;
  telegram_chat_id?: string | null;
  email_enabled?: boolean;
  telegram_enabled?: boolean;
  receives_order_notifications?: boolean;
  permissions?: string[];
  notification_topics?: string[];
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
  user: "bg-zinc-500/15 text-zinc-500 border-zinc-500/30",
  client: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
};

const ROLE_LABEL: Record<string, string> = {
  root: "Root", admin: "Админ", user: "Пользователь", client: "Клиент",
};

type ViewMode = "cards" | "table";

/* ── Helper functions ────────────────────────────────────────────── */
function fullName(u: User): string {
  return [u.name, u.surname].filter(Boolean).join(" ").trim();
}
function displayName(u: User): string {
  return fullName(u) || u.username || u.email.split("@")[0] || "Без имени";
}
function initials(u: User): string {
  const full = fullName(u);
  if (full) {
    return full.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
  }
  return (u.email[0] ?? "?").toUpperCase();
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════ */

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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) load();
  }, [currentUser, load]);

  if (userLoading || !currentUser) return null;
  if (currentUser.role !== "admin" && currentUser.role !== "root") {
    router.push("/");
    return null;
  }

  const isRoot = currentUser.role === "root";
  const canEdit = (u: User) => isRoot || u.role !== "admin";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.email, u.name, u.surname, u.phone, u.username]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [users, query]);

  const handleDelete = async (u: User) => {
    if (!confirm(`Удалить пользователя ${u.email}?`)) return;
    const res = await $fetch(`/api/v1/admin/users/${u.id}`, { method: "DELETE" });
    if (res.response?.ok) {
      toast.success("Пользователь удалён");
      load();
    } else {
      toast.error(res.json?.detail || "Ошибка удаления");
    }
  };

  const handleMakeTeamMember = async () => {
    if (!teamDialogUser || !teamRole.trim()) return;
    setTeamSaving(true);
    try {
      await makeTeamMember(teamDialogUser.id, {
        role: teamRole.trim(),
        bio: teamBio.trim() || undefined,
      });
      toast.success("Добавлен в команду");
      setTeamDialogUser(null);
      setTeamRole("");
      setTeamBio("");
      load();
    } catch (err: any) {
      toast.error(err.message || "Ошибка");
    } finally {
      setTeamSaving(false);
    }
  };

  const handleRemoveTeamMember = async (u: User) => {
    if (!confirm("Убрать из команды?")) return;
    try {
      await removeTeamMember(u.id);
      toast.success("Убран");
      load();
    } catch (err: any) {
      toast.error(err.message || "Ошибка");
    }
  };

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (u: User) => {
    setEditing(u);
    setDialogOpen(true);
  };

  return (
    <CheckUser permission="admin.users">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-display-2 mb-1">Пользователи</h1>
            <p className="text-body-3 text-(--on-bg-medium)">
              {loading
                ? "Загрузка…"
                : query
                  ? `${filtered.length} из ${users.length}`
                  : `${users.length} пользователей`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-0.5 rounded-full border border-(--outline) bg-(--card) p-0.5 h-9">
              {([
                { id: "cards", icon: GridFourIcon, label: "Карточки" },
                { id: "table", icon: RowsIcon, label: "Таблица" },
              ] as const).map((opt) => {
                const Icon = opt.icon;
                const isActive = view === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setView(opt.id)}
                    title={opt.label}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 h-8 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-(--on-bg-high) text-(--bg)"
                        : "text-(--on-bg-medium) hover:text-(--on-bg-high) hover:bg-(--state-hover)",
                    )}
                  >
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
            <p className="text-body-3 text-(--on-bg-medium)">
              {query ? "Ничего не найдено" : "Пользователей нет"}
            </p>
          </Card>
        )}

        {!loading && filtered.length > 0 && view === "cards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((u) => (
              <UserCard
                key={u.id}
                user={u}
                teamRole={teamRoles[u.id]}
                canEdit={canEdit(u)}
                isSelf={u.id === currentUser.id}
                onEdit={() => openEdit(u)}
                onDelete={() => handleDelete(u)}
                onAddToTeam={() => {
                  setTeamDialogUser(u);
                  setTeamRole("");
                  setTeamBio("");
                }}
                onRemoveFromTeam={() => handleRemoveTeamMember(u)}
              />
            ))}
          </div>
        )}

        {!loading && filtered.length > 0 && view === "table" && (
          <UserTable
            users={filtered}
            teamRoles={teamRoles}
            currentUserId={currentUser.id}
            canEdit={canEdit}
            onEdit={openEdit}
            onDelete={handleDelete}
            onAddToTeam={(u: User) => {
              setTeamDialogUser(u);
              setTeamRole("");
              setTeamBio("");
            }}
            onRemoveFromTeam={handleRemoveTeamMember}
          />
        )}
      </div>

      <UserEditorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editing}
        isRoot={isRoot}
        onSaved={load}
      />

      <Dialog
        open={!!teamDialogUser}
        onOpenChange={(open) => {
          if (!open) setTeamDialogUser(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UsersIcon className="size-5 text-(--primary)" />
              Добавить в команду
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {teamDialogUser && (
              <p className="text-body-4 text-(--on-bg-medium)">
                Пользователь: <b className="text-(--on-bg-high)">{displayName(teamDialogUser)}</b>
              </p>
            )}
            <Field>
              <FieldLabel>
                Роль <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                value={teamRole}
                onChange={(e) => setTeamRole(e.target.value)}
                placeholder="Со-основатель и CTO"
              />
            </Field>
            <Field>
              <FieldLabel>Био</FieldLabel>
              <Textarea
                value={teamBio}
                onChange={(e) => setTeamBio(e.target.value)}
                className="min-h-[100px]"
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outlined" onClick={() => setTeamDialogUser(null)}>
              Отмена
            </Button>
            <Button
              onClick={handleMakeTeamMember}
              disabled={!teamRole.trim() || teamSaving}
            >
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CheckUser>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CARDS VIEW
   ═══════════════════════════════════════════════════════════════════ */

function UserCard({
  user, teamRole, canEdit, isSelf,
  onEdit, onDelete, onAddToTeam, onRemoveFromTeam,
}: {
  user: User; teamRole?: string; canEdit: boolean; isSelf: boolean;
  onEdit: () => void; onDelete: () => void;
  onAddToTeam: () => void; onRemoveFromTeam: () => void;
}) {
  return (
    <Card className={cn(
      "group relative rounded-3xl border border-(--outline) bg-(--card) p-5 flex flex-col gap-4",
      "transition-all hover:border-(--primary)/40 hover:shadow-lg hover:shadow-(--primary)/5",
    )}>
      <div className="flex items-start gap-4">
        <Avatar className="size-14 shrink-0 ring-1 ring-(--outline)">
          {user.avatar_url && <AvatarImage src={user.avatar_url} alt="" />}
          <AvatarFallback className="text-heading-4 font-medium">{initials(user)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-heading-4 truncate">{displayName(user)}</h3>
            {user.verified ? (
              <CheckCircleIcon className="size-3.5 text-emerald-500 shrink-0" weight="fill" />
            ) : (
              <XCircleIcon className="size-3.5 text-(--on-bg-low) shrink-0" />
            )}
          </div>
          {user.username && (
            <p className="text-body-5 text-(--on-bg-low) truncate">@{user.username}</p>
          )}
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            <Badge variant="tonal-card-static" size="chip-small" className={ROLE_BADGE[user.role] ?? ROLE_BADGE.user}>
              {ROLE_LABEL[user.role] ?? user.role}
            </Badge>
            {user.blocked && (
              <Badge variant="tonal-card-static" size="chip-small" className="bg-rose-500/15 text-rose-500 border-rose-500/30">
                Заблокирован
              </Badge>
            )}
            {teamRole && (
              <Badge variant="tonal-primary-static" size="chip-small">
                {teamRole}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1.5 text-body-4 text-(--on-bg-medium)">
        <a href={`mailto:${user.email}`} className="flex items-center gap-2 hover:text-(--primary) truncate">
          <EnvelopeSimple className="size-3.5 shrink-0" />
          <span className="truncate">{user.email}</span>
        </a>
        {user.phone && (
          <a href={`tel:${user.phone}`} className="flex items-center gap-2 hover:text-(--primary)">
            <PhoneIcon className="size-3.5 shrink-0" />
            <span>{user.phone}</span>
          </a>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap pt-1">
        <NotifChip on={user.email_enabled ?? true} icon={<EnvelopeSimple className="size-3" />} label="Email" />
        <NotifChip on={user.telegram_enabled ?? true} icon={<TelegramLogo className="size-3" />} label="TG" />
      </div>

      <div className="flex items-center gap-1 pt-3 border-t border-(--outline) mt-auto">
        <Button variant="text" size="small" onClick={onEdit} disabled={!canEdit}>
          <PencilSimpleIcon className="size-4" />
          Изменить
        </Button>
        {teamRole ? (
          <Button variant="text" size="small" onClick={onRemoveFromTeam}>
            <UserMinusIcon className="size-4" />
          </Button>
        ) : (
          <Button variant="text" size="small" onClick={onAddToTeam}>
            <UsersIcon className="size-4" />
          </Button>
        )}
        <Button
          variant="text"
          size="small"
          className="ml-auto text-(--error) hover:bg-(--error-card)"
          onClick={onDelete}
          disabled={!canEdit || isSelf}
        >
          <TrashIcon className="size-4" />
        </Button>
      </div>
    </Card>
  );
}

function NotifChip({
  on, icon, label,
}: {
  on: boolean; icon: React.ReactNode; label: string;
}) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
      on
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        : "border-(--outline) bg-(--bg) text-(--on-bg-low) line-through",
    )}>
      {icon}
      {label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TABLE VIEW
   ═══════════════════════════════════════════════════════════════════ */

function UserTable({
  users, teamRoles, currentUserId, canEdit,
  onEdit, onDelete, onAddToTeam, onRemoveFromTeam,
}: any) {
  return (
    <Card className="rounded-3xl border-(--outline) bg-(--card) overflow-hidden">
      <div className="overflow-x-auto scrollbar-admin">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-(--outline) bg-(--bg)/50">
              <Th>Пользователь</Th>
              <Th>Контакты</Th>
              <Th>Роль</Th>
              <Th>Статус</Th>
              <Th>Уведомления</Th>
              <Th align="right">Действия</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: User) => {
              const editable = canEdit(u);
              const isSelf = u.id === currentUserId;
              const teamRole = teamRoles[u.id];
              return (
                <tr
                  key={u.id}
                  className="border-b border-(--outline)/50 last:border-b-0 hover:bg-(--state-hover) transition-colors"
                >
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 shrink-0 ring-1 ring-(--outline)">
                        {u.avatar_url && <AvatarImage src={u.avatar_url} alt="" />}
                        <AvatarFallback className="text-body-4 font-medium">{initials(u)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-body-3 font-medium truncate">{displayName(u)}</span>
                          {u.verified && (
                            <CheckCircleIcon className="size-3 text-emerald-500 shrink-0" weight="fill" />
                          )}
                        </div>
                        {u.username && (
                          <p className="text-body-5 text-(--on-bg-low) truncate">@{u.username}</p>
                        )}
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <div className="space-y-0.5">
                      <p className="text-body-4 text-(--on-bg-medium) truncate max-w-[220px]">
                        {u.email}
                      </p>
                      {u.phone && <p className="text-body-5 text-(--on-bg-low)">{u.phone}</p>}
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="tonal-card-static" size="chip-small" className={ROLE_BADGE[u.role] ?? ROLE_BADGE.user}>
                        {ROLE_LABEL[u.role] ?? u.role}
                      </Badge>
                      {teamRole && (
                        <Badge variant="tonal-primary-static" size="chip-small">
                          {teamRole}
                        </Badge>
                      )}
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {u.verified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                          <CheckCircleIcon className="size-3" weight="fill" />
                          Подтверждён
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-(--on-bg-low)">
                          <XCircleIcon className="size-3" />
                          Не подтверждён
                        </span>
                      )}
                      {u.blocked && (
                        <Badge variant="tonal-card-static" size="chip-small" className="bg-rose-500/15 text-rose-500 border-rose-500/30">
                          Блок
                        </Badge>
                      )}
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
                      <Button variant="text" size="icon-small" onClick={() => onEdit(u)} disabled={!editable}>
                        <PencilSimpleIcon className="size-4" />
                      </Button>
                      {teamRole ? (
                        <Button variant="text" size="icon-small" onClick={() => onRemoveFromTeam(u)}>
                          <UserMinusIcon className="size-4" />
                        </Button>
                      ) : (
                        <Button variant="text" size="icon-small" onClick={() => onAddToTeam(u)}>
                          <UsersIcon className="size-4" />
                        </Button>
                      )}
                      <Button
                        variant="text"
                        size="icon-small"
                        className="text-(--error) hover:bg-(--error-card)"
                        onClick={() => onDelete(u)}
                        disabled={!editable || isSelf}
                      >
                        <TrashIcon className="size-4" />
                      </Button>
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

function Th({
  children, align = "left",
}: {
  children: React.ReactNode; align?: "left" | "right";
}) {
  return (
    <th className={cn(
      "px-4 py-3 text-[11px] uppercase tracking-[0.08em] font-medium text-(--on-bg-low) whitespace-nowrap",
      align === "right" ? "text-right" : "text-left",
    )}>
      {children}
    </th>
  );
}

function Td({
  children, align = "left",
}: {
  children: React.ReactNode; align?: "left" | "right";
}) {
  return (
    <td className={cn("px-4 py-3 align-middle", align === "right" ? "text-right" : "text-left")}>
      {children}
    </td>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   EDITOR DIALOG
   ═══════════════════════════════════════════════════════════════════ */

interface FormState {
  email: string;
  password: string;
  name: string;
  surname: string;
  phone: string;
  username: string;
  avatar_url: string;
  role: string;
  verified: boolean;
  blocked: boolean;
  telegram_chat_id: string;
  email_enabled: boolean;
  telegram_enabled: boolean;
  receives_order_notifications: boolean;
  permissions: string[];
  notification_topics: string[];
}

function UserEditorDialog({
  open, onOpenChange, user, isRoot, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  user: User | null;
  isRoot: boolean;
  onSaved: () => void;
}) {
  const isCreate = !user;

  const emptyForm = (): FormState => ({
    email: "",
    password: "",
    name: "",
    surname: "",
    phone: "",
    username: "",
    avatar_url: "",
    role: "user",
    verified: false,
    blocked: false,
    telegram_chat_id: "",
    email_enabled: true,
    telegram_enabled: true,
    receives_order_notifications: false,
    permissions: [],
    notification_topics: [],
  });

  const [form, setForm] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (user) {
      setForm({
        email: user.email,
        password: "",
        name: user.name ?? "",
        surname: user.surname ?? "",
        phone: user.phone ?? "",
        username: user.username ?? "",
        avatar_url: user.avatar_url ?? "",
        role: user.role,
        verified: user.verified,
        blocked: user.blocked,
        telegram_chat_id: user.telegram_chat_id ?? "",
        email_enabled: user.email_enabled ?? true,
        telegram_enabled: user.telegram_enabled ?? true,
        receives_order_notifications: user.receives_order_notifications ?? false,
        permissions: user.permissions ?? [],
        notification_topics: user.notification_topics ?? [],
      });
    } else {
      setForm(emptyForm());
    }
    setErrors({});
  }, [open, user]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  // Target role determines which notification options are meaningful.
  // Order notifications only apply to admin/root; root-only edit is a
  // separate gate (isRoot).
  const targetIsAdmin = form.role === "admin" || form.role === "root";
  const showOrderNotifications = isRoot && !isCreate && targetIsAdmin;

  // Topics only make sense when at least one channel is enabled.
  const anyChannel = form.email_enabled || form.telegram_enabled;

  const handleSave = async () => {
    const next: Record<string, string> = {};
    if (!form.email.trim()) next.email = "Email обязателен";
    if (isCreate && !form.password) next.password = "Пароль обязателен";
    if (isCreate && form.password && form.password.length < 8)
      next.password = "Минимум 8 символов";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setErrors({});
    setSaving(true);

    try {
      if (isCreate) {
        const res = await $fetch("/api/v1/admin/users", {
          method: "POST",
          body: JSON.stringify({
            email: form.email.trim(),
            password: form.password,
            name: form.name.trim() || null,
            surname: form.surname.trim() || null,
            phone: form.phone.trim() || null,
            role: form.role,
            verified: form.verified,
            blocked: form.blocked,
          }),
          headers: { "Content-Type": "application/json" },
        });
        if (res.response?.ok) {
          toast.success("Создан");
          onOpenChange(false);
          onSaved();
        } else {
          const detail = res.json?.detail;
          if (Array.isArray(detail)) {
            const fe: Record<string, string> = {};
            detail.forEach((e: any) => {
              if (e.loc && e.loc.length > 1) fe[e.loc[1]] = e.msg;
            });
            setErrors(fe);
          } else {
            toast.error(detail || "Ошибка");
          }
        }
      } else {
        // Payload for the main PATCH — everything except the two
        // root-only fields, which go to their dedicated endpoints.
        const payload: any = {
          email: form.email.trim(),
          name: form.name.trim() || null,
          surname: form.surname.trim() || null,
          phone: form.phone.trim() || null,
          avatar_url: form.avatar_url.trim() || null,
          role: form.role,
          verified: form.verified,
          blocked: form.blocked,
          telegram_chat_id: form.telegram_chat_id.trim(),
          email_enabled: form.email_enabled,
          telegram_enabled: form.telegram_enabled,
        };
        if (form.password) payload.password = form.password;

        // Permissions — root only, admin targets only. Matches the
        // backend guard; sending for other cases earns a 403/422.
        if (isRoot && form.role === "admin") {
          payload.permissions = form.permissions;
        }

        const res = await $fetch(`/api/v1/admin/users/${user!.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
        });

        if (!res.response?.ok) {
          const detail = res.json?.detail;
          if (Array.isArray(detail)) {
            const fe: Record<string, string> = {};
            detail.forEach((e: any) => {
              if (e.loc && e.loc.length > 1) fe[e.loc[1]] = e.msg;
            });
            setErrors(fe);
          } else {
            toast.error(detail || "Ошибка");
          }
          setSaving(false);
          return;
        }

        // Order notifications have their own root-only endpoint.
        // Send only when the value actually changed — an unchanged
        // PUT is a no-op but still generates a 200 and an audit trail
        // entry. Skip it.
        if (
          showOrderNotifications &&
          form.receives_order_notifications !==
            (user!.receives_order_notifications ?? false)
        ) {
          const ordRes = await $fetch(
            `/api/v1/admin/users/${user!.id}/order-notifications`,
            {
              method: "PUT",
              body: JSON.stringify({ enabled: form.receives_order_notifications }),
              headers: { "Content-Type": "application/json" },
            },
          );
          if (!ordRes.response?.ok) {
            toast.error(
              ordRes.json?.detail || "Не удалось обновить уведомления о заявках",
            );
          }
        }

        // Topics — same PATCH endpoint, part of the same payload as
        // channel toggles. Backend whitelists against ALLOWED_TOPICS.
        // Send a second PATCH only if the topics differ, to avoid a
        // pointless write.
        const prevTopics = JSON.stringify(user!.notification_topics ?? []);
        const nextTopics = JSON.stringify(form.notification_topics);
        if (prevTopics !== nextTopics) {
          await $fetch(`/api/v1/admin/users/${user!.id}`, {
            method: "PATCH",
            body: JSON.stringify({ notification_topics: form.notification_topics }),
            headers: { "Content-Type": "application/json" },
          });
        }

        toast.success("Обновлён");
        onOpenChange(false);
        onSaved();
      }
    } catch {
      toast.error("Ошибка соединения");
    } finally {
      setSaving(false);
    }
  };

  const roleOptions = isRoot
    ? ROLE_OPTIONS
    : ROLE_OPTIONS.filter((o) => o.value !== "root");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto scrollbar-admin p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-(--outline) sticky top-0 bg-(--card) z-10">
          <DialogTitle>
            {isCreate ? "Новый пользователь" : "Редактирование"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-6 space-y-8">

          {/* ═══ Основное ═══════════════════════════════════════ */}
          <Section title="Основное">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field className="md:col-span-2" data-invalid={!!errors.email}>
                <FieldLabel>
                  Email <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
                {errors.email && <FieldError errors={[{ message: errors.email }]} />}
              </Field>
              <Field>
                <FieldLabel>Имя</FieldLabel>
                <Input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>Фамилия</FieldLabel>
                <Input
                  value={form.surname}
                  onChange={(e) => update("surname", e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>Телефон</FieldLabel>
                <Input
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>Username</FieldLabel>
                <Input
                  value={form.username}
                  onChange={(e) =>
                    update("username", e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
                  }
                />
              </Field>
            </div>
          </Section>

          {/* ═══ Роль и статус ═══════════════════════════════════ */}
          <Section title="Роль и статус">
            <Field>
              <FieldLabel>Роль</FieldLabel>
              <Select value={form.role} onValueChange={(v) => update("role", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="rounded-2xl border border-(--outline) bg-(--bg) px-4 divide-y divide-(--outline)">
              <SettingRow
                label="Подтверждён"
                description="Email подтверждён и аккаунт активен"
                checked={form.verified}
                onCheckedChange={(v) => update("verified", v)}
              />
              <SettingRow
                label="Заблокирован"
                description="Пользователь не может войти в систему"
                checked={form.blocked}
                onCheckedChange={(v) => update("blocked", v)}
              />
              {showOrderNotifications && (
                <SettingRow
                  label="Уведомления о заявках"
                  description="Письма о новых заявках на услуги"
                  checked={form.receives_order_notifications}
                  onCheckedChange={(v) => update("receives_order_notifications", v)}
                />
              )}
            </div>
          </Section>

          {/* ═══ Доступ к разделам (root only, admin targets) ════ */}
          {isRoot && !isCreate && form.role === "admin" && (
            <Section
              title="Доступ к разделам"
              actions={
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="text"
                    size="small"
                    onClick={() =>
                      update("permissions", ADMIN_PERMISSIONS.map((p) => p.key))
                    }
                  >
                    Все
                  </Button>
                  <Button
                    type="button"
                    variant="text"
                    size="small"
                    onClick={() => update("permissions", [])}
                  >
                    Ничего
                  </Button>
                </div>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {ADMIN_PERMISSIONS.map((p) => {
                  const checked = form.permissions.includes(p.key);
                  return (
                    <label
                      key={p.key}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors",
                        checked
                          ? "border-(--primary) bg-(--primary-glass)"
                          : "border-(--outline) hover:border-(--on-bg-low)",
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => {
                          const next =
                            v === true
                              ? [...form.permissions, p.key]
                              : form.permissions.filter((k) => k !== p.key);
                          update("permissions", next);
                        }}
                      />
                      <span
                        className={cn(
                          "text-body-4",
                          checked ? "text-(--primary) font-medium" : "text-(--on-bg-high)",
                        )}
                      >
                        {p.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </Section>
          )}

          {/* ═══ Уведомления ═════════════════════════════════════ */}
          {!isCreate && (
            <Section
              title="Уведомления"
              subtitle="Управление письмами и сообщениями пользователю"
            >
              {/* ── Обязательные (не отключаются) ──────────────── */}
              <div className="rounded-2xl border border-(--outline) bg-(--bg) px-4 divide-y divide-(--outline)">
                <SettingRow
                  icon={ShieldCheck}
                  label="Транзакционные"
                  description="Сброс пароля, подтверждение email, чеки — всегда отправляются"
                  locked
                />
                <SettingRow
                  icon={EnvelopeOpen}
                  label="Правовые"
                  description="Обновления политики, условий и согласий — всегда отправляются"
                  locked
                />
              </div>

              {/* ── Каналы ─────────────────────────────────────── */}
              <div className="mt-4">
                <Subheading>Каналы доставки</Subheading>
                <div className="mt-2 rounded-2xl border border-(--outline) bg-(--bg) px-4 divide-y divide-(--outline)">
                  <SettingRow
                    icon={EnvelopeSimple}
                    label="Email"
                    description="Письма на указанный адрес"
                    checked={form.email_enabled}
                    onCheckedChange={(v) => update("email_enabled", v)}
                  />
                  <SettingRow
                    icon={TelegramLogo}
                    label="Telegram"
                    description="Сообщения от бота"
                    checked={form.telegram_enabled}
                    onCheckedChange={(v) => update("telegram_enabled", v)}
                  />
                </div>
                {form.telegram_enabled && (
                  <Field className="mt-3">
                    <FieldLabel className="text-body-5 text-(--on-bg-low)">
                      Telegram Chat ID
                    </FieldLabel>
                    <Input
                      value={form.telegram_chat_id}
                      onChange={(e) => update("telegram_chat_id", e.target.value)}
                      className="font-mono text-body-4"
                      placeholder="123456789"
                    />
                    <p className="text-body-5 text-(--on-bg-low) mt-1">
                      Пользователь получает сообщения только если chat ID указан.
                    </p>
                  </Field>
                )}
              </div>

              {/* ── Темы ───────────────────────────────────────── */}
              <div className="mt-4">
                <Subheading>Что присылать</Subheading>
                {!anyChannel && (
                  <p className="text-body-5 text-(--on-bg-low) mt-1">
                    Включите хотя бы один канал, чтобы выбрать темы.
                  </p>
                )}
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {USER_TOPICS.map((topic) => {
                    const checked = form.notification_topics.includes(topic.key);
                    const Icon = TOPIC_ICON[topic.key];
                    return (
                      <button
                        key={topic.key}
                        type="button"
                        disabled={!anyChannel}
                        onClick={() => {
                          const next = checked
                            ? form.notification_topics.filter((k) => k !== topic.key)
                            : [...form.notification_topics, topic.key];
                          update("notification_topics", next);
                        }}
                        className={cn(
                          "flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
                          "disabled:cursor-not-allowed disabled:opacity-50",
                          checked
                            ? "border-(--primary) bg-(--primary-glass)"
                            : "border-(--outline) hover:border-(--primary)/40",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-lg",
                            checked
                              ? "bg-(--primary) text-(--on-primary)"
                              : "bg-(--state-hover) text-(--on-bg-medium)",
                          )}
                        >
                          <Icon className="size-4" weight="regular" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block text-body-4 font-medium leading-snug",
                              checked ? "text-(--primary)" : "text-(--on-bg-high)",
                            )}
                          >
                            {topic.label}
                          </span>
                          <span className="block text-body-5 text-(--on-bg-low) leading-snug mt-0.5">
                            {topic.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Section>
          )}

          {/* ═══ Пароль ═════════════════════════════════════════ */}
          <Section title={isCreate ? "Пароль" : "Сменить пароль"}>
            <Field data-invalid={!!errors.password}>
              <FieldLabel>{isCreate ? "Пароль *" : "Новый пароль"}</FieldLabel>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder={
                  isCreate
                    ? "Минимум 8 символов, цифра и заглавная"
                    : "Оставьте пустым, чтобы не менять"
                }
              />
              {errors.password && (
                <FieldError errors={[{ message: errors.password }]} />
              )}
            </Field>
          </Section>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-(--outline) sticky bottom-0 bg-(--card)">
          <Button
            variant="outlined"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Сохранение…" : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Section / Subheading helpers ─────────────────────────────────── */

function Section({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 className="text-body-5 uppercase tracking-[0.14em] text-(--on-bg-low)">
            {title}
          </h3>
          {subtitle && (
            <p className="text-body-5 text-(--on-bg-low) mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

function Subheading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-body-5 text-(--on-bg-medium) font-medium">{children}</p>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TOPIC ICONS
   ═══════════════════════════════════════════════════════════════════ */

const TOPIC_ICON: Record<string, React.ComponentType<{ className?: string; weight?: "regular" | "bold" | "fill" }>> = {
  events: CalendarBlank,
  vershiny: Trophy,
  marketing: Megaphone,
  news: Newspaper,
  jobs: Briefcase,
};
