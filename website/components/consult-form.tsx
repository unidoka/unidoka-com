"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PhoneInputField } from "@/components/ui/phone-input";
import { $fetch } from "@/utils/fetch";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { useLanguage } from "@/providers/language-provider";

interface ConsultFormProps {
  onSuccess?: () => void;
}

export function ConsultForm({ onSuccess }: ConsultFormProps) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    telegram: "",
    description: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2)
      next.name = t("consult.form.error_name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = t("consult.form.error_email");
    if (!form.phone) next.phone = t("consult.form.error_phone");
    if (!agreed) next.agreement = t("consult.form.error_agreement");
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
        toast.error(msg || t("consult.form.error_send"));
        return;
      }
      toast.success(t("consult.form.success"));
      setForm({ name: "", email: "", phone: "", telegram: "", description: "" });
      setAgreed(false);
      onSuccess?.();
    } catch {
      toast.error(t("consult.form.error_connection"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field data-invalid={!!errors.name}>
        <FieldLabel>{t("consult.form.name_label")}</FieldLabel>
        <Input
          name="name"
          autoComplete="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder={t("consult.form.name_placeholder")}
        />
        {errors.name && <FieldError errors={[{ message: errors.name }]} />}
      </Field>
      <Field data-invalid={!!errors.email}>
        <FieldLabel>{t("consult.form.email_label")}</FieldLabel>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder={t("consult.form.email_placeholder")}
        />
        {errors.email && <FieldError errors={[{ message: errors.email }]} />}
      </Field>
      <Field data-invalid={!!errors.phone}>
        <FieldLabel>{t("consult.form.phone_label")}</FieldLabel>
        <PhoneInputField
          name="phone"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v ?? "" })}
          error={errors.phone}
        />
      </Field>
      <Field>
        <FieldLabel>{t("consult.form.telegram_label")}</FieldLabel>
        <Input
          name="telegram"
          value={form.telegram}
          onChange={(e) => setForm({ ...form, telegram: e.target.value })}
          placeholder={t("consult.form.telegram_placeholder")}
        />
      </Field>
      <Field>
        <FieldLabel>{t("consult.form.description_label")}</FieldLabel>
        <Textarea
          name="description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder={t("consult.form.description_placeholder")}
          className="min-h-[80px]"
        />
      </Field>
      <Button type="submit" size="large" className="w-full" disabled={loading}>
        {loading && <CircleNotchIcon className="size-4 animate-spin" />}
        {loading ? t("consult.form.submitting") : t("consult.form.submit")}
      </Button>
      <div className="flex items-start gap-3 pt-1">
        <Checkbox
          id="consult-agreement"
          checked={agreed}
          onCheckedChange={(v) => setAgreed(v === true)}
          className="mt-0.5 shrink-0"
        />
        <label
          htmlFor="consult-agreement"
          className="flex-1 text-body-6 font-normal text-(--on-bg-low) leading-relaxed cursor-pointer"
        >
          {t("consult.form.agreement_prefix")}{" "}
          <Link
            href="/docs/consent"
            target="_blank"
            rel="noopener noreferrer"
            className="text-(--primary) underline underline-offset-2 hover:opacity-80"
          >
            {t("consult.form.agreement_consent")}
          </Link>{" "}
          {t("consult.form.agreement_middle")}{" "}
          <Link
            href="/docs/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-(--primary) underline underline-offset-2 hover:opacity-80"
          >
            {t("consult.form.agreement_privacy")}
          </Link>{" "}
          {t("consult.form.agreement_and")}{" "}
          <Link
            href="/docs/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-(--primary) underline underline-offset-2 hover:opacity-80"
          >
            {t("consult.form.agreement_terms")}
          </Link>
          .
        </label>
      </div>
      {errors.agreement && (
        <FieldError errors={[{ message: errors.agreement }]} />
      )}
    </form>
  );
}
