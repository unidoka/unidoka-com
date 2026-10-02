"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeftIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { CheckNotUser } from "@/entities/user/model/check-not-user";
import { useLanguage } from "@/providers/language-provider";
import { forgotPassword } from "@/utils/api/auth";

const schema = z.object({
  email: z.string().email("errors.email_invalid"),
});

export default function ForgotPasswordPage() {
  const { t, lang } = useLanguage();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const result = schema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "errors.email_invalid");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword({ email: email.trim(), lang });
      setSent(true);
    } catch (err: any) {
      // Backend always returns 200 for valid input; a thrown error here
      // means network / 5xx — show a generic message.
      toast.error(err?.message || t("errors.connection"));
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <CheckNotUser>
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="w-full max-w-md text-center">
            <div className="inline-flex size-16 items-center justify-center rounded-3xl bg-(--primary-card) text-(--primary) mb-6">
              <EnvelopeSimpleIcon className="size-8" weight="duotone" />
            </div>
            <h1 className="text-display-3 md:text-display-2 mb-3">
              {t("forms.forgot.sent_title")}
            </h1>
            <p className="text-body-3 text-(--on-bg-medium) leading-relaxed mb-2">
              {t("forms.forgot.sent_body")}
            </p>
            <p className="text-body-5 text-(--on-bg-low) mb-8">
              {t("forms.forgot.sent_hint")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outlined" asChild>
                <Link href="/login">
                  <ArrowLeftIcon className="size-4" />
                  {t("forms.forgot.back_to_login")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CheckNotUser>
    );
  }

  return (
    <CheckNotUser>
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-display-3 md:text-display-2 mb-2">
              {t("forms.forgot.title")}
            </h1>
            <p className="text-body-4 text-(--on-bg-medium) leading-relaxed">
              {t("forms.forgot.subtitle")}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <Field data-invalid={!!error}>
              <FieldLabel>{t("forms.email")}</FieldLabel>
              <Input
                type="email"
                name="email"
                autoComplete="email"
                autoFocus
                placeholder={t("forms.email_placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FieldError errors={error ? [{ message: t(error) }] : []} />
            </Field>

            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Spinner className="size-4" />}
              {loading ? t("forms.forgot.submitting") : t("forms.forgot.submit")}
            </Button>

            <div className="text-center text-sm">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-(--on-bg-medium) hover:text-(--primary) transition-colors"
              >
                <ArrowLeftIcon className="size-3.5" />
                {t("forms.forgot.back_to_login")}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </CheckNotUser>
  );
}
