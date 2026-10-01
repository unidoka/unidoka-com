"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PhoneInputField } from "@/components/ui/phone-input";
import { $fetch } from "@/utils/fetch";
import { CircleNotchIcon } from "@phosphor-icons/react";
interface ConsultFormProps {
  onSuccess?: () => void;
}
export function ConsultForm({ onSuccess }: ConsultFormProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    telegram: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const validate = () => {
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "Имя должно быть не короче 2 символов";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Некорректный email";
    if (!form.phone) next.phone = "Укажите телефон";
    setErrors(next);
    return Object.keys(next).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await $fetch("/api/v1/consult", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone,
          telegram: form.telegram.trim() || null,
          description: form.description.trim() || null,
        }),
        headers: { "Content-Type": "application/json" },
        isToast: false,
      });
      if (!res?.response?.ok) {
        const detail = res?.json?.detail;
        const msg = Array.isArray(detail) ? detail[0]?.msg : detail;
        toast.error(msg || "Не удалось отправить заявку");
        return;
      }
      toast.success("Заявка отправлена! Свяжемся с вами в течение рабочего дня.");
      setForm({ name: "", email: "", phone: "", telegram: "", description: "" });
      onSuccess?.();
    } catch {
      toast.error("Ошибка соединения. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field data-invalid={!!errors.name}>
        <FieldLabel>Ваше имя *</FieldLabel>
        <Input
          name="name"
          autoComplete="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Иван"
        />
        {errors.name && <FieldError errors={[{ message: errors.name }]} />}
      </Field>
      <Field data-invalid={!!errors.email}>
        <FieldLabel>Email *</FieldLabel>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@example.com"
        />
        {errors.email && <FieldError errors={[{ message: errors.email }]} />}
      </Field>
      <Field data-invalid={!!errors.phone}>
        <FieldLabel>Телефон *</FieldLabel>
        <PhoneInputField
          name="phone"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v ?? "" })}
          error={errors.phone}
        />
      </Field>
      <Field>
        <FieldLabel>Telegram (опционально)</FieldLabel>
        <Input
          name="telegram"
          value={form.telegram}
          onChange={(e) => setForm({ ...form, telegram: e.target.value })}
          placeholder="@username"
        />
      </Field>
      <Field>
        <FieldLabel>Описание задачи (опционально)</FieldLabel>
        <Textarea
          name="description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Коротко о том, что нужно сделать"
          className="min-h-[80px]"
        />
      </Field>
      <Button type="submit" size="large" className="w-full" disabled={loading}>
        {loading && <CircleNotchIcon className="size-4 animate-spin" />}
        {loading ? "Отправка…" : "Отправить заявку"}
      </Button>
      <p className="text-body-6 text-(--on-bg-low) text-center leading-relaxed">
        Отправляя форму, вы соглашаетесь с обработкой персональных данных
      </p>
    </form>
  );
}
