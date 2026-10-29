"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckUser } from "@/entities/user/model/check-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { CopyButton } from "@/components/ui/copy-button";
import {
  Key,
  PlusIcon,
  TrashIcon,
  CircleNotchIcon,
  WarningIcon,
  ShieldCheck,
} from "@phosphor-icons/react";
import {
  listMyApiKeys,
  createMyApiKey,
  revokeMyApiKey,
  type ApiKey,
} from "@/utils/api/api-keys";

export default function ProfileApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);


  const load = useCallback(async () => {
    setLoading(true);
    try {
      setKeys(await listMyApiKeys());
    } catch (err: any) {
      toast.error(err?.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error("Укажите название ключа");
      return;
    }
    setCreating(true);
    try {
      const created = await createMyApiKey({ name: newName.trim() });
      setCreatedKey(created.full_key);
      setCreateOpen(false);
      setNewName("");
      await load();
    } catch (err: any) {
      toast.error(err?.message || "Не удалось создать ключ");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (k: ApiKey) => {
    if (!confirm(`Отозвать ключ «${k.name}»?`)) return;
    try {
      await revokeMyApiKey(k.id);
      toast.success("Ключ отозван");
      await load();
    } catch (err: any) {
      toast.error(err?.message || "Ошибка");
    }
  };

  return (
    <CheckUser>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-display-2 mb-1">API-ключи</h1>
            <p className="text-body-3 text-(--on-bg-medium)">
              Ключи для программного доступа к вашему аккаунту
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <PlusIcon className="size-4" />
            Создать ключ
          </Button>
        </div>

        <Card className="rounded-3xl border-(--outline) bg-(--card) p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-(--primary-card) text-(--primary)">
              <ShieldCheck className="size-4" />
            </span>
            <div className="text-body-4 text-(--on-bg-medium) leading-relaxed pr-2">
              Работают от вашего имени. Не присылайте ключи посторонним людям. Отозванный ключ перестаёт работать сразу.
            </div>
          </div>
        </Card>

        {loading ? (
          <Card className="rounded-3xl border-(--outline) p-10 text-center">
            <CircleNotchIcon className="size-5 animate-spin mx-auto text-(--on-bg-low)" />
          </Card>
        ) : keys.length === 0 ? (
          <Card className="rounded-3xl border-(--outline) p-12 text-center">
            <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-(--primary-card) text-(--primary) mb-4">
              <Key className="size-6" />
            </div>
            <p className="text-body-3 text-(--on-bg-medium) mb-4">
              У вас пока нет API-ключей.
            </p>
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon className="size-4" />
              Создать первый
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {keys.map((k) => (
              <Card
                key={k.id}
                className="rounded-2xl border-(--outline) bg-(--card) p-4 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-body-3 font-medium truncate">{k.name}</p>
                    {!k.is_active && (
                      <Badge variant="tonal-card-static" size="chip-small">Отозван</Badge>
                    )}
                    {k.expires_at && new Date(k.expires_at) < new Date() && (
                      <Badge variant="tonal-card-static" size="chip-small">Истёк</Badge>
                    )}
                  </div>
                  <p className="text-body-5 font-mono text-(--on-bg-low)">
                    {k.key_prefix}…{" "}
                    {k.last_used_at
                      ? `· исп. ${new Date(k.last_used_at).toLocaleString("ru-RU")}`
                      : "· ещё не использовался"}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="text" size="icon-small" className="text-(--error)" onClick={() => handleRevoke(k)} disabled={!k.is_active} aria-label="Отозвать">
                    <TrashIcon className="size-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Новый API-ключ</DialogTitle></DialogHeader>
          <Field>
            <FieldLabel>Название <span className="text-destructive">*</span></FieldLabel>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Например, MCP-Cursor" autoFocus />
            <p className="text-body-5 text-(--on-bg-low) mt-1">
              Поможет понять, где используется ключ.
            </p>
          </Field>
          <DialogFooter>
            <Button variant="outlined" onClick={() => setCreateOpen(false)}>Отмена</Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating && <CircleNotchIcon className="size-4 animate-spin" />}
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!createdKey} onOpenChange={(o) => !o && setCreatedKey(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Ключ создан</DialogTitle></DialogHeader>
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
            <WarningIcon className="size-4 shrink-0 text-amber-500 mt-0.5" />
            <p className="text-body-5 text-(--on-bg-medium) leading-relaxed">
              Скопируйте ключ сейчас. Он не будет показан полностью снова,
              но вы всегда сможете увидеть его через «Показать».
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-(--outline) bg-(--bg) p-3">
            <code className="flex-1 font-mono text-body-5 break-all">{createdKey}</code>
            <CopyButton text={createdKey || ""} />
          </div>
          <DialogFooter><Button onClick={() => setCreatedKey(null)}>Готово</Button></DialogFooter>
        </DialogContent>
      </Dialog>

    </CheckUser>
  );
}
