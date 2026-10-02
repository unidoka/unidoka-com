"use client";

import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { toast } from "sonner";

export interface TaxonomyField {
  key: string;
  label: string;
  type?: "text" | "textarea" | "boolean" | "number";
  placeholder?: string;
  required?: boolean;
  default?: unknown;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Row when editing, `null` for create. */
  initial: Record<string, any> | null;
  fields: TaxonomyField[];
  onSave: (data: Record<string, any>) => Promise<void>;
}

/** Reusable dialog for organizer / type / direction / subdirection CRUD. */
export function TaxonomyEditorDialog({
  open, onOpenChange, title, initial, fields, onSave,
}: Props) {
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initial) setForm({ ...initial });
    else setForm(Object.fromEntries(fields.map((f) => [f.key, f.default ?? (f.type === "boolean" ? true : "")])));
  }, [open, initial, fields]);

  const handleSave = async () => {
    const missing = fields.find((f) => f.required && !form[f.key]?.toString().trim());
    if (missing) { toast.error(`${missing.label} обязательно`); return; }
    setSaving(true);
    try {
      await onSave(form);
    } catch (e: any) {
      toast.error(e?.message || "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          {fields.map((f) => (
            <Field key={f.key}>
              <FieldLabel>{f.label}{f.required && <span className="text-destructive ml-1">*</span>}</FieldLabel>
              {f.type === "boolean" ? (
                <div className="flex items-center gap-3 h-10">
                  <Switch
                    checked={!!form[f.key]}
                    onCheckedChange={(v) => setForm({ ...form, [f.key]: v })}
                  />
                  <Label className="text-body-4">{form[f.key] ? "Да" : "Нет"}</Label>
                </div>
              ) : f.type === "textarea" ? (
                <Textarea
                  value={form[f.key] ?? ""}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                />
              ) : (
                <Input
                  type={f.type === "number" ? "number" : "text"}
                  value={form[f.key] ?? ""}
                  onChange={(e) => setForm({ ...form, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value })}
                  placeholder={f.placeholder}
                />
              )}
            </Field>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outlined" onClick={() => onOpenChange(false)} disabled={saving}>Отмена</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <CircleNotchIcon className="size-4 animate-spin" />}
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
