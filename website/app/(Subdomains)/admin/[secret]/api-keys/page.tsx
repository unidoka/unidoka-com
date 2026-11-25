"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CopyButton } from "@/components/ui/copy-button";
import {
  ArrowClockwiseIcon,
  CircleNotchIcon,
  TrashIcon,
  Key,
} from "@phosphor-icons/react";
import {
  listAllApiKeys,
  revokeAnyApiKey,
  type AdminApiKey,
} from "@/utils/api/api-keys";
import { AdminFilterBar } from "../../_components/admin-filter-bar";

export default function AdminApiKeysPage() {
  const { user, isLoading: userLoading } = useUser();
  const [rows, setRows] = useState<AdminApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await listAllApiKeys(debounced || undefined, activeOnly));
    } catch (err: any) {
      toast.error(err?.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [debounced, activeOnly]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  if (userLoading || !user) return null;
  const isRoot = user.role === "root";

  const handleRevoke = async (k: AdminApiKey) => {
    if (!confirm(`Отозвать ключ «${k.name}» (${k.user_email})?`)) return;
    try {
      await revokeAnyApiKey(k.id);
      toast.success("Отозван");
      await load();
    } catch (err: any) {
      toast.error(err?.message || "Ошибка");
    }
  };

  return (
    <CheckUser permission="admin.apikeys">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-heading-1 mb-1">API-ключи</h1>
            <p className="text-body-5 text-(--on-bg-low)">
              {loading ? "Загрузка…" : `${rows.length} ключей`}
            </p>
          </div>
          <Button variant="text" size="icon-small" onClick={load} disabled={loading} aria-label="Обновить">
            {loading ? <CircleNotchIcon className="size-4 animate-spin" /> : <ArrowClockwiseIcon className="size-4" />}
          </Button>
        </div>

        <AdminFilterBar
          query={query}
          onQueryChange={setQuery}
          placeholder="Поиск по пользователю, email, префиксу…"
          fields={[
            {
              id: "state",
              label: "Статус",
              value: activeOnly ? "active" : "all",
              onChange: (value) => setActiveOnly(value === "active"),
              options: [
                { value: "all", label: "Все" },
                { value: "active", label: "Только активные" },
              ],
            },
          ]}
          onReset={() => {
            setQuery("");
            setActiveOnly(false);
          }}
        />

        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="rounded-2xl border-(--outline) h-20 animate-pulse bg-muted/30" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <Card className="rounded-3xl border-(--outline) p-12 text-center">
            <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-(--primary-card) text-(--primary) mb-4">
              <Key className="size-6" />
            </div>
            <p className="text-body-3 text-(--on-bg-medium)">
              {debounced ? "Ничего не найдено" : "Ключей пока нет"}
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {rows.map((k) => (
              <Card key={k.id} className="rounded-2xl border-(--outline) bg-(--card) p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-body-3  truncate">{k.name}</p>
                    {!k.is_active && (
                      <Badge variant="tonal-card-static" size="chip-small" className="border-rose-500/30 bg-rose-500/10 text-rose-500">Отозван</Badge>
                    )}
                  </div>
                  <p className="text-body-5 text-(--on-bg-medium) truncate">
                    {k.user_name || k.user_email}
                    <span className="text-(--on-bg-low)"> · {k.user_email}</span>
                  </p>
                  <p className="text-body-5 font-mono text-(--on-bg-low) mt-1">
                    {k.key_prefix}…{" "}
                    {k.last_used_at ? `· исп. ${new Date(k.last_used_at).toLocaleString("ru-RU")}` : "· не использовался"}
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

    </CheckUser>
  );
}
