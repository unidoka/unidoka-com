"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "@/components/ui/password-input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { $fetch } from "@/utils/fetch";
import { CheckNotUser } from "@/entities/user/model/check-not-user";
import { useLanguage } from "@/providers/language-provider";
import { extractErrorMessage } from "@/lib/error-message";

/**
 * Zod schema with i18n KEYS (not translated strings) as messages.
 * The keys are resolved with `t()` at render time, so flipping the
 * language switcher re-renders existing errors correctly.
 */
const registerSchema = z.object({
  email: z.string().email("errors.email_invalid"),
  password: z
    .string()
    .min(8, "errors.password_too_short")
    .regex(/\d/, "errors.password_needs_digit")
    .regex(/[A-Z]/, "errors.password_needs_upper"),
  // Explicit consent required to submit the form (152-ФЗ).
  // `z.literal(true)` fails when the checkbox is unchecked.
  agreement: z.literal(true, { error: "errors.agreement_required" }),
});

export default function RegisterPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();

  const [errors, setErrors] = useState<Record<string, string> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    agreement: false,
  });

  // Bot protection: reject submissions within 3 seconds of page load.
  const [pageLoadTime, setPageLoadTime] = useState(0);
  useEffect(() => {
    setPageLoadTime(Date.now());
  }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setErrors(null);
    setIsLoading(true);

    if (Date.now() - pageLoadTime < 3000) {
      toast.error(t("errors.bot_too_fast"));
      setIsLoading(false);
      return;
    }

    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await $fetch("/api/v1/register/email", {
        method: "POST",
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          lang,
        }),
        headers: { "Content-Type": "application/json" },
        onLoadingChange: setIsLoading,
        isToast: false,
      });

      // FastAPI validation (422) — unpack field-level errors
      if (response?.response?.status === 422) {
        const detail = response?.json?.detail;
        if (Array.isArray(detail)) {
          const fieldErrors: Record<string, string> = {};
          detail.forEach((err: any) => {
            const loc = err.loc;
            if (loc && loc.length > 1) fieldErrors[loc[1]] = err.msg;
          });
          setErrors(fieldErrors);
        } else if (detail) {
          toast.error(
            extractErrorMessage(response?.json, t("errors.register_failed")),
          );
        }
        setIsLoading(false);
        return;
      }

      if (!response?.response?.ok) {
        toast.error(
          extractErrorMessage(response?.json, t("errors.register_failed")),
        );
        setIsLoading(false);
        return;
      }

      toast.success(t("errors.code_sent"), { duration: 5000 });
      toast.info(t("errors.code_check_spam"), {
        duration: 8000,
        description: t("errors.code_check_spam_hint"),
      });
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch {
      toast.error(t("errors.connection"));
      setIsLoading(false);
    }
  }

  return (
    <CheckNotUser>
      <div className="flex items-center justify-center min-h-[80vh] px-4 py-12">
        <div className="w-full max-w-md">
          {/* ── Header ───────────────────────────────────────────── */}
          <div className="mb-8 text-center">
            <h1 className="text-display-3 md:text-display-2 mb-2">
              {t("forms.register.title")}
            </h1>
            <p className="text-body-4 text-(--on-bg-medium)">
              {t("forms.register.subtitle")}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleRegister}>
            {/* ── Email ─────────────────────────────────────────── */}
            <Field data-invalid={!!errors?.email}>
              <FieldLabel>{t("forms.email")}</FieldLabel>
              <Input
                type="email"
                name="email"
                autoComplete="email"
                placeholder={t("forms.email_placeholder")}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <FieldError
                errors={errors?.email ? [{ message: t(errors.email) }] : []}
              />
            </Field>

            {/* ── Password ──────────────────────────────────────── */}
            <Field data-invalid={!!errors?.password}>
              <FieldLabel>{t("forms.password")}</FieldLabel>
              <PasswordInput
                name="password"
                mode="signup"
                placeholder={t("forms.password_placeholder")}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <FieldError
                errors={errors?.password ? [{ message: t(errors.password) }] : []}
              />
            </Field>

            {/* ── 152-ФЗ consent ────────────────────────────────── */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="register-agreement"
                checked={formData.agreement}
                onCheckedChange={(v) =>
                  setFormData({ ...formData, agreement: v === true })
                }
                className="mt-0.5 shrink-0"
              />
              <label
                htmlFor="register-agreement"
                className="flex-1 text-body-4 text-(--on-bg-medium) leading-snug cursor-pointer"
              >
                {t("forms.register.agreement_pre")}{" "}
                <Link
                  href="/docs/consent"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-(--primary) underline underline-offset-2 hover:opacity-80"
                >
                  {t("forms.register.agreement_consent")}
                </Link>{" "}
                {t("forms.register.agreement_and_confirm")}{" "}
                <Link
                  href="/docs/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-(--primary) underline underline-offset-2 hover:opacity-80"
                >
                  {t("forms.register.agreement_privacy")}
                </Link>{" "}
                {t("forms.register.agreement_and_accept")}{" "}
                <Link
                  href="/docs/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-(--primary) underline underline-offset-2 hover:opacity-80"
                >
                  {t("forms.register.agreement_terms")}
                </Link>
                .
              </label>
            </div>
            {errors?.agreement && (
              <FieldError errors={[{ message: t(errors.agreement) }]} />
            )}

            {/* ── Submit ────────────────────────────────────────── */}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Spinner className="size-4" />}
              {isLoading
                ? t("forms.register.submitting")
                : t("forms.register.submit")}
            </Button>

            {/* ── Login link ────────────────────────────────────── */}
            <div className="text-center text-sm">
              <span className="text-(--on-bg-medium)">
                {t("forms.register.have_account")}{" "}
              </span>
              <Link
                href="/login"
                className="text-(--primary) hover:opacity-80 font-medium transition-opacity underline-offset-2 hover:underline"
              >
                {t("forms.register.login_link")}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </CheckNotUser>
  );
}
