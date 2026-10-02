"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  PlusIcon, XIcon, CircleNotchIcon, WarningIcon, CheckCircleIcon,
} from "@phosphor-icons/react";
import {
  submitEvent, type EventPayload, type EventTypeInput,
} from "@/utils/api/events";
import {
  fetchOrganizersPublic, fetchEventTypesPublic, fetchDirectionsPublic,
  type Organizer, type EventTypeTaxonomy, type Direction,
} from "@/utils/api/event-taxonomies";

export default function SubmitEventPage() {
  const router = useRouter();
  const { user } = useUser();

  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [types, setTypes] = useState<EventTypeTaxonomy[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const [form, setForm] = useState({
    title: "",
    short_description: "",
    description: "",
    cover_image_src: "",
    href: "",
    start_at: "",
    end_at: "",
    location_name: "",
    address: "",
    metro: "",
    city: "",
    price: "",
    capacity: "",
    registration_url: "",
    organizer_id: "",
    subdirection_ids: [] as string[],
  });

  // Multiple type selections. `custom` entries hold a free-text name.
  const [typeSelections, setTypeSelections] = useState<
    Array<{ id: string; isCustom: boolean; customName: string }>
  >([]);

  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchOrganizersPublic(),
      fetchEventTypesPublic(),
      fetchDirectionsPublic(),
    ])
      .then(([o, t, d]) => {
        setOrganizers(o);
        setTypes(t);
        setDirections(d);
      })
      .catch(() => toast.error("Не удалось загрузить справочники"))
      .finally(() => setLoadingMeta(false));
  }, []);

  const addType = (typeId: string) => {
    if (!typeId) return;
    if (typeSelections.some((t) => t.id === typeId && !t.isCustom)) return;
    setTypeSelections((prev) => [
      ...prev,
      { id: typeId, isCustom: false, customName: "" },
    ]);
  };
  const addCustomType = () => {
    setTypeSelections((prev) => [
      ...prev,
      { id: `custom-${Date.now()}`, isCustom: true, customName: "" },
    ]);
  };
  const updateCustomName = (id: string, name: string) => {
    setTypeSelections((prev) =>
      prev.map((t) => (t.id === id ? { ...t, customName: name } : t)),
    );
  };
  const removeType = (id: string) => {
    setTypeSelections((prev) => prev.filter((t) => t.id !== id));
  };
  const toggleSubdirection = (sid: string) => {
    setForm((prev) => ({
      ...prev,
      subdirection_ids: prev.subdirection_ids.includes(sid)
        ? prev.subdirection_ids.filter((x) => x !== sid)
        : [...prev.subdirection_ids, sid],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Укажите название");
    if (!agree) return toast.error("Подтвердите согласие на модерацию");

    setSubmitting(true);
    try {
      const typePayload: EventTypeInput[] = typeSelections.map((t) =>
        t.isCustom
          ? { custom_name: t.customName.trim() || "Другое" }
          : { type_id: t.id },
      );

      const payload: EventPayload = {
        title: form.title.trim(),
        short_description: form.short_description.trim() || null,
        description: form.description.trim() || null,
        cover_image_src: form.cover_image_src.trim() || null,
        href: form.href.trim() || null,
        start_at: form.start_at ? new Date(form.start_at).toISOString() : null,
        end_at: form.end_at ? new Date(form.end_at).toISOString() : null,
        location_name: form.location_name.trim() || null,
        address: form.address.trim() || null,
        metro: form.metro.trim() || null,
        city: form.city.trim() || null,
        price: form.price.trim() || null,
        capacity: form.capacity ? Number(form.capacity) : null,
        registration_url: form.registration_url.trim() || null,
        organizer_id: form.organizer_id || null,
        types: typePayload,
        subdirection_ids: form.subdirection_ids,
      };

      await submitEvent(payload);
      toast.success(
        "Событие отправлено на модерацию. Мы сообщим после проверки.",
        { duration: 6000 },
      );
      router.push("/events");
    } catch (err: any) {
      toast.error(err?.message || "Ошибка отправки");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CheckUser>
      <main className="min-h-screen bg-(--bg) pb-24">
        <section className="pt-12 md:pt-20 pb-10 border-b border-(--outline)">
          <Container>
            <div className="max-w-[900px]">
              <p className="text-body-5 uppercase tracking-[0.3em] text-(--on-bg-low) mb-3">
                Событие
              </p>
              <h1 className="text-display-2 md:text-display-1 mb-4">
                Добавить событие
              </h1>
              <p className="text-body-2 text-(--on-bg-medium) leading-relaxed max-w-2xl">
                Заполните форму — событие отправится на модерацию. Обычно
                проверка занимает до 1 рабочего дня. После одобрения оно
                появится в календаре.
              </p>
            </div>
          </Container>
        </section>

        <section className="py-10 md:py-14">
          <Container>
            <div className="max-w-[900px]">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basics */}
                <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
                  <h2 className="text-heading-3">Основное</h2>
                  <Field>
                    <FieldLabel>Название <span className="text-destructive">*</span></FieldLabel>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  </Field>
                  <Field>
                    <FieldLabel>Короткое описание</FieldLabel>
                    <Input
                      value={form.short_description}
                      onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                      placeholder="Одно предложение для карточки"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Полное описание</FieldLabel>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="min-h-[120px]"
                    />
                  </Field>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Начало</FieldLabel>
                      <Input type="datetime-local" value={form.start_at} onChange={(e) => setForm({ ...form, start_at: e.target.value })} />
                    </Field>
                    <Field>
                      <FieldLabel>Конец</FieldLabel>
                      <Input type="datetime-local" value={form.end_at} onChange={(e) => setForm({ ...form, end_at: e.target.value })} />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel>Ссылка на сайт события</FieldLabel>
                    <Input value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })} placeholder="https://…" />
                  </Field>
                  <Field>
                    <FieldLabel>Обложка (URL)</FieldLabel>
                    <Input value={form.cover_image_src} onChange={(e) => setForm({ ...form, cover_image_src: e.target.value })} placeholder="/uploads/media/… или https://…" />
                  </Field>
                </Card>

                {/* Location */}
                <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
                  <h2 className="text-heading-3">Место и регистрация</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field><FieldLabel>Место</FieldLabel><Input value={form.location_name} onChange={(e) => setForm({ ...form, location_name: e.target.value })} /></Field>
                    <Field><FieldLabel>Город</FieldLabel><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
                    <Field className="md:col-span-2"><FieldLabel>Адрес</FieldLabel><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
                    <Field><FieldLabel>Метро</FieldLabel><Input value={form.metro} onChange={(e) => setForm({ ...form, metro: e.target.value })} /></Field>
                    <Field><FieldLabel>Цена</FieldLabel><Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Бесплатно" /></Field>
                    <Field><FieldLabel>Вместимость</FieldLabel><Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></Field>
                    <Field><FieldLabel>Ссылка на регистрацию</FieldLabel><Input value={form.registration_url} onChange={(e) => setForm({ ...form, registration_url: e.target.value })} /></Field>
                  </div>
                </Card>

                {/* Organizer */}
                <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
                  <h2 className="text-heading-3">Организатор</h2>
                  <Field>
                    <FieldLabel>Кто проводит</FieldLabel>
                    <Select value={form.organizer_id} onValueChange={(v) => setForm({ ...form, organizer_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Выберите…" /></SelectTrigger>
                      <SelectContent>
                        {organizers.map((o) => (
                          <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </Card>

                {/* Types */}
                <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
                  <h2 className="text-heading-3">Типы <span className="text-body-5 text-(--on-bg-low) font-normal">(можно несколько)</span></h2>
                  <div className="flex flex-wrap gap-2">
                    {types.map((t) => {
                      const selected = typeSelections.some((x) => x.id === t.id && !x.isCustom);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() =>
                            selected ? removeType(t.id) : addType(t.id)
                          }
                          className={
                            "rounded-full px-3 py-1.5 text-body-4 font-medium transition-colors " +
                            (selected
                              ? "bg-(--primary) text-white"
                              : "bg-(--card) border border-(--outline) text-(--on-bg-medium) hover:text-(--on-bg-high)")
                          }
                        >
                          {t.name}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={addCustomType}
                      className="rounded-full px-3 py-1.5 text-body-4 font-medium border border-dashed border-(--outline) text-(--on-bg-low) hover:border-(--primary) hover:text-(--primary) transition-colors inline-flex items-center gap-1"
                    >
                      <PlusIcon className="size-3.5" />
                      Другое
                    </button>
                  </div>
                  {/* Custom type inputs — one row per "Other" selection */}
                  {typeSelections.filter((t) => t.isCustom).map((t) => (
                    <div key={t.id} className="flex items-center gap-2">
                      <Input
                        value={t.customName}
                        onChange={(e) => updateCustomName(t.id, e.target.value)}
                        placeholder="Название типа (например, «Кибербезопасность»)"
                      />
                      <Button type="button" variant="text" size="icon-small" onClick={() => removeType(t.id)}>
                        <XIcon className="size-4" />
                      </Button>
                    </div>
                  ))}
                </Card>

                {/* Tags = Vershiny subdirections */}
                <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
                  <h2 className="text-heading-3">Направления</h2>
                  <p className="text-body-4 text-(--on-bg-medium)">
                    Выберите одно или несколько направлений из Вершин.
                  </p>
                  <div className="space-y-4">
                    {directions.map((d) => (
                      <div key={d.id}>
                        <p className="text-body-4 font-medium text-(--on-bg-high) mb-2">
                          {d.emoji} {d.name}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {d.subdirections.map((s) => {
                            const on = form.subdirection_ids.includes(s.id);
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => toggleSubdirection(s.id)}
                                className={
                                  "rounded-full px-2.5 py-1 text-body-5 font-medium transition-colors " +
                                  (on
                                    ? "bg-(--primary) text-white"
                                    : "bg-(--bg) border border-(--outline) text-(--on-bg-medium) hover:text-(--on-bg-high)")
                                }
                              >
                                {s.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Agreement */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="submit-agree"
                    checked={agree}
                    onCheckedChange={(v) => setAgree(v === true)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="submit-agree" className="flex-1 text-body-4 text-(--on-bg-medium) leading-snug cursor-pointer">
                    Подтверждаю, что событие реальное, и даю согласие на его публикацию после модерации. Ознакомлен(а) с{" "}
                    <Link href="/docs/terms" className="text-(--primary) underline">Пользовательским соглашением</Link>.
                  </Label>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" size="large" disabled={submitting}>
                    {submitting && <CircleNotchIcon className="size-4 animate-spin" />}
                    Отправить на модерацию
                  </Button>
                  <Button type="button" variant="outlined" size="large" asChild>
                    <Link href="/events">Отмена</Link>
                  </Button>
                </div>
              </form>
            </div>
          </Container>
        </section>
      </main>
    </CheckUser>
  );
}
