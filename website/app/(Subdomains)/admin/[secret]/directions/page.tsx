"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus, Trash, PencilSimple, CircleNotchIcon, CaretDownIcon, CaretUpIcon,
} from "@phosphor-icons/react";
import {
  adminListDirections, adminCreateDirection, adminUpdateDirection,
  adminDeleteDirection, adminCreateSubdirection, adminUpdateSubdirection,
  adminDeleteSubdirection, type Direction, type Subdirection,
} from "@/utils/api/event-taxonomies";
import { TaxonomyEditorDialog } from "../_components/taxonomy-editor-dialog";

export default function AdminDirectionsPage() {
  const { user, isLoading } = useUser();
  const [rows, setRows] = useState<Direction[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editingDir, setEditingDir] = useState<Direction | null>(null);
  const [dirOpen, setDirOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<{ sub: Subdirection; dirId: string } | null>(null);
  const [subOpen, setSubOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setRows(await adminListDirections()); }
    catch (e: any) { toast.error(e?.message || "Ошибка загрузки"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { if (user) load(); }, [user, load]);
  if (isLoading || !user) return null;
  if (user.role !== "admin" && user.role !== "root") return null;

  const saveDir = async (d: Partial<Direction>) => {
    if (editingDir) await adminUpdateDirection(editingDir.id, d);
    else await adminCreateDirection(d);
    toast.success("Сохранено");
    setDirOpen(false);
    load();
  };
  const saveSub = async (s: Partial<Subdirection>) => {
    if (editingSub) await adminUpdateSubdirection(editingSub.sub.id, s);
    else await adminCreateSubdirection(editingSub!.dirId, s);
    toast.success("Сохранено");
    setSubOpen(false);
    load();
  };

  return (
    <CheckUser>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-display-2 mb-1">Направления</h1>
            <p className="text-body-3 text-(--on-bg-medium)">
              Вершины — направления и поднаправления (теги событий)
            </p>
          </div>
          <Button onClick={() => { setEditingDir(null); setDirOpen(true); }}>
            <Plus className="size-4" /> Направление
          </Button>
        </div>

        {loading ? (
          <Card className="rounded-3xl border-(--outline) p-10 text-center">
            <CircleNotchIcon className="size-5 animate-spin mx-auto text-(--on-bg-low)" />
          </Card>
        ) : (
          <div className="space-y-3">
            {rows.map((d) => {
              const isOpen = expanded[d.id];
              return (
                <Card key={d.id} className="rounded-3xl border-(--outline) bg-(--card) overflow-hidden">
                  <div className="flex items-center gap-3 p-4">
                    <button
                      type="button"
                      onClick={() => setExpanded((p) => ({ ...p, [d.id]: !p[d.id] }))}
                      className="size-8 rounded-full flex items-center justify-center hover:bg-(--state-hover)"
                    >
                      {isOpen ? <CaretUpIcon className="size-4" /> : <CaretDownIcon className="size-4" />}
                    </button>
                    <span className="text-2xl">{d.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-3 font-medium truncate">{d.name}</p>
                      <p className="text-body-5 text-(--on-bg-low) font-mono">
                        /{d.slug} · {d.subdirections.length} поднаправл.
                      </p>
                    </div>
                    {!d.is_active && <Badge variant="tonal-card-static" size="chip-small">Скрыт</Badge>}
                    <Button variant="text" size="icon-small" onClick={() => { setEditingDir(d); setDirOpen(true); }}>
                      <PencilSimple className="size-4" />
                    </Button>
                    <Button variant="text" size="icon-small" onClick={async () => {
                      if (!confirm(`Удалить «${d.name}» и все поднаправления?`)) return;
                      await adminDeleteDirection(d.id); toast.success("Удалено"); load();
                    }}>
                      <Trash className="size-4" />
                    </Button>
                  </div>
                  {isOpen && (
                    <div className="border-t border-(--outline) p-4 space-y-2">
                      {d.subdirections.map((s) => (
                        <div key={s.id} className="flex items-center gap-2 pl-8">
                          <p className="flex-1 text-body-4">{s.name}</p>
                          {!s.is_active && <Badge variant="tonal-card-static" size="chip-small">Скрыт</Badge>}
                          <Button variant="text" size="icon-small" onClick={() => { setEditingSub({ sub: s, dirId: d.id }); setSubOpen(true); }}>
                            <PencilSimple className="size-3.5" />
                          </Button>
                          <Button variant="text" size="icon-small" onClick={async () => {
                            if (!confirm(`Удалить «${s.name}»?`)) return;
                            await adminDeleteSubdirection(s.id); toast.success("Удалено"); load();
                          }}>
                            <Trash className="size-3.5" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => { setEditingSub({ sub: null as any, dirId: d.id }); setSubOpen(true); }}
                      >
                        <Plus className="size-3.5" /> Добавить поднаправление
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <TaxonomyEditorDialog
        open={dirOpen}
        onOpenChange={setDirOpen}
        title={editingDir ? "Редактировать направление" : "Новое направление"}
        initial={editingDir}
        fields={[
          { key: "name", label: "Название", required: true },
          { key: "slug", label: "Slug (URL)" },
          { key: "emoji", label: "Emoji", placeholder: "💻" },
          { key: "sort_order", label: "Порядок", type: "number", default: 0 },
          { key: "is_active", label: "Активно", type: "boolean", default: true },
        ]}
        onSave={saveDir}
      />

      <TaxonomyEditorDialog
        open={subOpen}
        onOpenChange={setSubOpen}
        title={editingSub?.sub ? "Редактировать поднаправление" : "Новое поднаправление"}
        initial={editingSub?.sub ?? null}
        fields={[
          { key: "name", label: "Название", required: true },
          { key: "slug", label: "Slug (URL)" },
          { key: "sort_order", label: "Порядок", type: "number", default: 0 },
          { key: "is_active", label: "Активно", type: "boolean", default: true },
        ]}
        onSave={saveSub}
      />
    </CheckUser>
  );
}
