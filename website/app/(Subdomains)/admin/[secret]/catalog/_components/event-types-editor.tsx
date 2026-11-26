"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/entities/user/model/user-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash, PencilSimple, CircleNotchIcon } from "@phosphor-icons/react";
import {
  adminListTypes,
  adminCreateType,
  adminUpdateType,
  adminDeleteType,
  type EventTypeTaxonomy,
} from "@/utils/api/event-taxonomies";
import { TaxonomyEditorDialog } from "../../_components/taxonomy-editor-dialog";

export function EventTypesEditor() {
  const { user, isLoading } = useUser();
  const [rows, setRows] = useState<EventTypeTaxonomy[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EventTypeTaxonomy | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await adminListTypes());
    } catch (e: any) {
      toast.error(e?.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  if (isLoading || !user) return null;

  const handleSave = async (data: Partial<EventTypeTaxonomy>) => {
    if (editing) await adminUpdateType(editing.id, data);
    else await adminCreateType(data);
    toast.success("Сохранено");
    setDialogOpen(false);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-body-4 text-(--on-bg-medium)">
          {rows.length} типов
        </p>
        <Button
          className="shrink-0"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" /> Добавить
        </Button>
      </div>

      {loading ? (
        <Card className="rounded-3xl border-(--outline) p-10 text-center">
          <CircleNotchIcon className="size-5 animate-spin mx-auto text-(--on-bg-low)" />
        </Card>
      ) : (
        <Card className="rounded-3xl border-(--outline) bg-(--card) divide-y divide-(--outline) overflow-hidden gap-0 py-0">
          {rows.map((t) => (
            <div
              key={t.id}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-2 sm:gap-3 items-center p-3 sm:p-4"
            >
              <span
                className="size-6 rounded-md"
                style={{ background: t.color || "#888" }}
              />
              <div className="min-w-0">
                <p className="text-body-3 truncate">{t.name}</p>
                <p className="text-body-5 text-(--on-bg-low) font-mono truncate">
                  /{t.slug}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                {!t.is_active && (
                  <Badge variant="tonal-card-static" size="chip-small">
                    Скрыт
                  </Badge>
                )}
                <Button
                  variant="text"
                  size="icon-small"
                  onClick={() => {
                    setEditing(t);
                    setDialogOpen(true);
                  }}
                >
                  <PencilSimple className="size-4" />
                </Button>
                <Button
                  variant="text"
                  size="icon-small"
                  onClick={async () => {
                    if (!confirm(`Удалить «${t.name}»?`)) return;
                    await adminDeleteType(t.id);
                    toast.success("Удалено");
                    load();
                  }}
                >
                  <Trash className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </Card>
      )}

      <TaxonomyEditorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? "Редактировать тип" : "Новый тип"}
        initial={editing}
        fields={[
          { key: "name", label: "Название", required: true },
          { key: "slug", label: "Slug (URL)" },
          { key: "icon", label: "Иконка (phosphor name)", placeholder: "cpu" },
          { key: "color", label: "Цвет", type: "color", placeholder: "#3b82f6" },
          { key: "sort_order", label: "Порядок", type: "number", default: 0 },
          { key: "is_active", label: "Активен", type: "boolean", default: true },
        ]}
        onSave={handleSave}
      />
    </div>
  );
}
