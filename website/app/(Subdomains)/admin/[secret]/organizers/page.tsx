"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { ImageUploadField } from "@/components/editor/image-upload-field";
import { toast } from "sonner";
import {
  Plus, Trash, PencilSimple, CircleNotchIcon,
} from "@phosphor-icons/react";
import {
  adminListOrganizers, adminCreateOrganizer, adminUpdateOrganizer,
  adminDeleteOrganizer, type Organizer,
} from "@/utils/api/event-taxonomies";
import { $fetch } from "@/utils/fetch";

const NO_OWNER = "__none__";

export default function AdminOrganizersPage() {
  const { user, isLoading } = useUser();
  const [rows, setRows] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Array<{ id: string; email: string; name: string | null; username: string | null }>>([]);
  const [editing, setEditing] = useState<Organizer | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [orgs, usersRes] = await Promise.all([
        adminListOrganizers(),
        $fetch("/api/v1/admin/users", { isToast: false }).catch(() => ({ json: [] })),
      ]);
      setRows(orgs);
      if (Array.isArray(usersRes.json)) setUsers(usersRes.json);
    } catch (e: any) {
      toast.error(e?.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (user) load(); }, [user, load]);

  if (isLoading || !user) return null;
  if (user.role !== "admin" && user.role !== "root") return null;

  const handleDelete = async (o: Organizer) => {
    if (!confirm(`Удалить организатора «${o.name}»?`)) return;
    await adminDeleteOrganizer(o.id);
    toast.success("Удалено");
    load();
  };

  return (
    <CheckUser>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-display-2 mb-1">Организаторы</h1>
            <p className="text-body-3 text-(--on-bg-medium)">{rows.length} организаторов</p>
          </div>
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus className="size-4" />
            Добавить
          </Button>
        </div>

        {loading ? (
          <Card className="rounded-3xl border-(--outline) p-10 text-center">
            <CircleNotchIcon className="size-5 animate-spin mx-auto text-(--on-bg-low)" />
          </Card>
        ) : (
          <Card className="rounded-3xl border-(--outline) bg-(--card) divide-y divide-(--outline) overflow-hidden">
            {rows.map((o) => (
              <div key={o.id} className="grid grid-cols-[auto_1fr_auto] gap-3 items-center p-4">
                {o.avatar_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={o.avatar_url}
                    alt=""
                    className="size-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <span
                    className="size-10 rounded-full shrink-0 flex items-center justify-center text-body-3 font-semibold"
                    style={{
                      background: o.color
                        ? `color-mix(in srgb, ${o.color} 22%, transparent)`
                        : "var(--state-hover)",
                      color: o.color || "var(--on-bg-high)",
                    }}
                  >
                    {o.name.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-body-3 font-medium truncate">{o.name}</p>
                  <p className="text-body-5 text-(--on-bg-low) font-mono">/{o.slug}</p>
                </div>
                <div className="flex gap-1">
                  {!o.is_active && (
                    <Badge variant="tonal-card-static" size="chip-small">Скрыт</Badge>
                  )}
                  <Button variant="text" size="icon-small" onClick={() => { setEditing(o); setDialogOpen(true); }}>
                    <PencilSimple className="size-4" />
                  </Button>
                  <Button variant="text" size="icon-small" onClick={() => handleDelete(o)}>
                    <Trash className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>

      <OrganizerEditorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        users={users}
        onSaved={load}
      />
    </CheckUser>
  );
}

function OrganizerEditorDialog({
  open, onOpenChange, editing, users, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: Organizer | null;
  users: Array<{ id: string; email: string; name: string | null; username: string | null }>;
  onSaved: () => void;
}) {
  const isEdit = !!editing;
  const [form, setForm] = useState({
    name: "",
    slug: "",
    color: "",
    avatar_url: "",
    owner_id: NO_OWNER,
    description: "",
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        name: editing.name,
        slug: editing.slug,
        color: editing.color ?? "",
        avatar_url: editing.avatar_url ?? "",
        owner_id: editing.owner_id ?? NO_OWNER,
        description: editing.description ?? "",
        is_active: editing.is_active,
      });
    } else {
      setForm({
        name: "", slug: "", color: "", avatar_url: "",
        owner_id: NO_OWNER, description: "", is_active: true,
      });
    }
  }, [open, editing]);

  const update = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Название обязательно"); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        color: form.color.trim() || null,
        avatar_url: form.avatar_url.trim() || null,
        owner_id: form.owner_id === NO_OWNER ? null : form.owner_id,
        description: form.description.trim() || null,
        is_active: form.is_active,
      };
      if (isEdit && editing) await adminUpdateOrganizer(editing.id, payload);
      else await adminCreateOrganizer(payload);
      toast.success("Сохранено");
      onOpenChange(false);
      onSaved();
    } catch (err: any) {
      toast.error(err?.message || "Ошибка");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto scrollbar-admin p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-(--outline) sticky top-0 bg-(--card) z-10">
          <DialogTitle>{isEdit ? "Редактировать организатора" : "Новый организатор"}</DialogTitle>
        </DialogHeader>
        <div className="px-6 py-5 space-y-5">
          <Field>
            <FieldLabel>Аватар</FieldLabel>
            <ImageUploadField
              value={form.avatar_url}
              onChange={(v) => update("avatar_url", v)}
              aspect={1}
              outputSize={256}
              variant="avatar"
              fallbackText={form.name.slice(0, 2).toUpperCase()}
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field className="md:col-span-2">
              <FieldLabel>Название <span className="text-destructive">*</span></FieldLabel>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
            </Field>
            <Field>
              <FieldLabel>Slug</FieldLabel>
              <Input value={form.slug} onChange={(e) => update("slug", e.target.value)} />
            </Field>
            <Field>
              <FieldLabel>Цвет (hex)</FieldLabel>
              <Input
                value={form.color}
                onChange={(e) => update("color", e.target.value)}
                placeholder="#336DFF"
              />
            </Field>
            <Field className="md:col-span-2">
              <FieldLabel>Владелец (админ)</FieldLabel>
              <Select value={form.owner_id} onValueChange={(v) => update("owner_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Не назначен" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_OWNER}>— Не назначен —</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name || u.username || u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field className="md:col-span-2">
              <FieldLabel>Описание</FieldLabel>
              <Textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                className="min-h-[80px]"
              />
            </Field>
            <div className="flex items-center gap-3 md:col-span-2">
              <input
                id="org-active"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => update("is_active", e.target.checked)}
                className="size-4 rounded border-(--outline)"
              />
              <Label htmlFor="org-active" className="text-body-4 cursor-pointer">
                Активен
              </Label>
            </div>
          </div>
        </div>
        <DialogFooter className="px-6 py-4 border-t border-(--outline) sticky bottom-0 bg-(--card)">
          <Button variant="outlined" onClick={() => onOpenChange(false)} disabled={saving}>
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
