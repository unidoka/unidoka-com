"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUploadField } from "@/components/editor/image-upload-field";
import { toast } from "sonner";
import { CircleNotchIcon, Buildings } from "@phosphor-icons/react";
import { createCompany, updateCompany, type ClientListItem } from "@/utils/api/companies";
const LIFECYCLE_OPTIONS = [
  { value: "lead", label: "Lead" },
  { value: "prospect", label: "Prospect" },
  { value: "customer", label: "Customer" },
  { value: "regular", label: "Regular" },
];
export function CompanyEditorDialog({ client, open, onOpenChange, onSaved }: {
  client: ClientListItem | null; open: boolean; onOpenChange: (o: boolean) => void; onSaved: () => void;
}) {
  const isEdit = !!client;
  const [form, setForm] = useState({ name: "", slug: "", website: "", industry: "", description: "", logotype_url: "", lifecycle_stage: "lead" });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!open) return;
    if (client) {
      setForm({
        name: client.name, slug: client.slug, website: client.website || "",
        industry: client.industry || "", description: (client as any).description || "",
        logotype_url: client.logotype_url || "", lifecycle_stage: (client as any).lifecycle_stage || "lead",
      });
    } else setForm({ name: "", slug: "", website: "", industry: "", description: "", logotype_url: "", lifecycle_stage: "lead" });
  }, [client, open]);
  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Название обязательно"); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(), slug: form.slug.trim() || undefined,
        website: form.website.trim() || null, industry: form.industry.trim() || null,
        description: form.description.trim() || null, logotype_url: form.logotype_url.trim() || null,
        lifecycle_stage: form.lifecycle_stage,
      };
      if (isEdit && client) { await updateCompany(client.id, payload); toast.success("Обновлено"); }
      else { await createCompany(payload); toast.success("Создано"); }
      onSaved(); onOpenChange(false);
    } catch (err: any) { toast.error(err?.message || "Ошибка"); }
    finally { setSaving(false); }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-(--primary-card) text-(--primary)"><Buildings className="size-4" /></div>
            {isEdit ? "Редактировать" : "Новая компания"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field className="md:col-span-2"><FieldLabel>Название <span className="text-destructive">*</span></FieldLabel>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} /></Field>
            <Field><FieldLabel>Slug</FieldLabel><Input value={form.slug} onChange={(e) => update("slug", e.target.value)} />
              <p className="text-body-6 text-(--on-bg-low) mt-1">/companies/{form.slug || "…"}</p></Field>
            <Field><FieldLabel>Сайт</FieldLabel><Input value={form.website} onChange={(e) => update("website", e.target.value)} /></Field>
            <Field><FieldLabel>Отрасль</FieldLabel><Input value={form.industry} onChange={(e) => update("industry", e.target.value)} /></Field>
            <Field><FieldLabel>Стадия</FieldLabel>
              <Select value={form.lifecycle_stage} onValueChange={(v) => update("lifecycle_stage", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LIFECYCLE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select></Field>
            <Field className="md:col-span-2"><FieldLabel>Описание</FieldLabel>
              <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} className="min-h-[80px]" /></Field>
            <Field className="md:col-span-2"><FieldLabel>Логотип</FieldLabel>
              <ImageUploadField value={form.logotype_url} onChange={(v) => update("logotype_url", v)} /></Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outlined" onClick={() => onOpenChange(false)} disabled={saving}>Отмена</Button>
          <Button onClick={handleSave} disabled={saving}>{saving && <CircleNotchIcon className="size-4 animate-spin" />}Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
