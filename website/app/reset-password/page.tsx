"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  WarningIcon,
  LockIcon,
} from "@phosphor-icons/react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { CheckNotUser } from "@/entities/user/model/check-not-user";
import { useLanguage } from "@/providers/language-provider";
import { resetPassword } from "@/utils/api/auth";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "errors.password_too_short")
      .regex(/\d/, "errors.password_needs_digit")
      .regex(/[A-Z]/, "errors.password_needs_upper"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "errors.password_mismatch",
  });

function ResetInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // If no token in the URL, render the invalid-link state immediately.
  const hasToken = !!token && token.length >= 8;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors(null);

    const result = schema.safeParse({ password, confirm });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token: token!, new_password: password });
      setDone(true);
      toast.success(t("forms.reset.success_title"));
      // Bounce to login after a short pause so the success message lands.
      setTimeout(() => router.push("/login"), 1600);
    } catch (err: any) {
      toast.error(err?.message || t("errors.connection"));
    } finally {
      setLoading(false);
    }
  }

  // ── Invalid link ───────────────────────────────────────────────────
  if (!hasToken) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex size-16 items-center justify-center rounded-3xl bg-(--warning-card) text-(--warning) mb-6">
            <WarningIcon className="size-8" weight="duotone" />
          </div>
          <h1 className="text-display-3 md:text-display-2 mb-3">
            {t("forms.reset.invalid_title")}
          </h1>
          <p className="text-body-3 text-(--on-bg-medium) leading-relaxed mb-8">
            {t("forms.reset.invalid_body")}
          </p>
          <Button asChild>
            <Link href="/forgot-password">{t("forms.reset.request_new")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex size-16 items-center justify-center rounded-3xl bg-(--success-card) text-(--success) mb-6">
            <CheckCircleIcon className="size-8" weight="duotone" />
          </div>
          <h1 className="text-display-3 md:text-display-2 mb-3">
            {t("forms.reset.success_title")}
          </h1>
          <p className="text-body-3 text-(--on-bg-medium) mb-8">
            {t("forms.reset.success_body")}
          </p>
          <Button asChild>
            <Link href="/login">
              <ArrowLeftIcon className="size-4" />
              {t("forms.forgot.back_to_login")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── Reset form ─────────────────────────────────────────────────────
  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex size-14 items-center justify-center rounded-3xl bg-(--primary-card) text-(--primary) mb-5">
            <LockIcon className="size-7" weight="duotone" />
          </div>
          <h1 className="text-display-3 md:text-display-2 mb-2">
            {t("forms.reset.title")}
          </h1>
          <p className="text-body-4 text-(--on-bg-medium) leading-relaxed">
            {t("forms.reset.subtitle")}
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <Field data-invalid={!!errors?.password}>
            <FieldLabel>{t("forms.reset.new_password")}</FieldLabel>
            <Input
              type="password"
              name="password"
              autoComplete="new-password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FieldError
              errors={errors?.password ? [{ message: t(errors.password) }] : []}
            />
          </Field>

          <Field data-invalid={!!errors?.confirm}>
            <FieldLabel>{t("forms.reset.confirm_password")}</FieldLabel>
            <Input
              type="password"
              name="confirm"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <FieldError
              errors={errors?.confirm ? [{ message: t(errors.confirm) }] : []}
            />
          </Field>

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Spinner className="size-4" />}
            {loading ? t("forms.reset.submitting") : t("forms.reset.submit")}
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
  );
}

export default function ResetPasswordPage() {
  return (
    <CheckNotUser>
      <Suspense fallback={null}>
        <ResetInner />
      </Suspense>
    </CheckNotUser>
  );
}
