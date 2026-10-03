"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  CircleNotchIcon,
  EnvelopeSimpleIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { CheckNotUser } from "@/entities/user/model/check-not-user";
import { useUser } from "@/entities/user/model/user-context";
import { useLanguage } from "@/providers/language-provider";
import { $fetch } from "@/utils/fetch";
import { safeCookieStorage } from "@/utils/safe-cookie-storage";

// Resend cooldown in seconds. Backend enforces 5s (see
// `limit_otp_send` in config/rate_limiter.py); we hold a longer UI-side
// cooldown so users don't spam the SMTP provider through a refresh.
const RESEND_COOLDOWN = 30;

function VerifyEmailInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, lang } = useLanguage();
  const { setToken } = useUser();

  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // No email in the URL -> nothing to verify. Bounce to /register.
  useEffect(() => {
    if (!email) router.replace("/register");
  }, [email, router]);

  // Resend cooldown ticker.
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(
      () => setCooldown((c) => Math.max(0, c - 1)),
      1000,
    );
    return () => clearInterval(id);
  }, [cooldown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (code.length !== 6) {
      setError("errors.code_length");
      return;
    }
    setLoading(true);
    try {
      const res = await $fetch("/api/v1/verify-email", {
        method: "POST",
        body: JSON.stringify({ email, code }),
        headers: { "Content-Type": "application/json" },
        isToast: false,
      });
      if (!res?.response?.ok) {
        const detail = res?.json?.detail;
        const msg = Array.isArray(detail) ? detail[0]?.msg : detail;
        toast.error(msg || t("errors.verify_failed"));
        setLoading(false);
        return;
      }
      const access = res.json?.access_token;
      const refresh = res.json?.refresh_token;
      if (!access || !refresh) {
        toast.error(t("errors.tokens_missing"));
        setLoading(false);
        return;
      }
      // Persist the session the same way /login does so UserProvider
      // picks it up on the next render of any page.
      safeCookieStorage.setItem("access_token", access);
      safeCookieStorage.setItem("refresh_token", refresh);
      setToken(access);
      router.push("/");
    } catch {
      toast.error(t("errors.connection"));
      setLoading(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      const res = await $fetch("/api/v1/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email, lang }),
        headers: { "Content-Type": "application/json" },
        isToast: false,
      });
      if (!res?.response?.ok) {
        const detail = res?.json?.detail;
        toast.error(detail || t("errors.code_send_failed"));
        return;
      }
      toast.success(t("errors.code_sent_again"));
      setCooldown(RESEND_COOLDOWN);
    } catch {
      toast.error(t("errors.connection"));
    } finally {
      setResending(false);
    }
  }

  return (
    <CheckNotUser>
      <div className="flex items-center justify-center min-h-[80vh] px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex size-16 items-center justify-center rounded-3xl bg-(--primary-card) text-(--primary) mb-6">
              <EnvelopeSimpleIcon className="size-8" weight="duotone" />
            </div>
            <h1 className="text-display-3 md:text-display-2 mb-2">
              {t("forms.verify.title")}
            </h1>
            <p className="text-body-4 text-(--on-bg-medium) leading-relaxed">
              {t("forms.verify.subtitle")}
            </p>
            {email && (
              <p className="text-body-5 text-(--on-bg-low) mt-2 font-mono break-all">
                {email}
              </p>
            )}
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Field data-invalid={!!error}>
              <FieldLabel>{t("forms.verify.code")}</FieldLabel>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={(v) => {
                    setCode(v);
                    if (error) setError(null);
                  }}
                  autoFocus
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  aria-label={t("forms.verify.code")}
                >
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className="size-11 text-base"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {error && <FieldError errors={[{ message: t(error) }]} />}
            </Field>

            <Button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full"
            >
              {loading ? t("forms.verify.submitting") : t("forms.verify.submit")}
            </Button>

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || resending}
                className="inline-flex items-center gap-1.5 text-(--primary) hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {resending && (
                  <CircleNotchIcon className="size-3.5 animate-spin" />
                )}
                {cooldown > 0
                  ? `${t("forms.verify.resend")} (${cooldown})`
                  : resending
                    ? t("forms.verify.resending")
                    : t("forms.verify.resend")}
              </button>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 text-(--on-bg-medium) hover:text-(--primary) transition-colors"
              >
                <ArrowLeftIcon className="size-3.5" />
                {t("forms.verify.back")}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </CheckNotUser>
  );
}

// useSearchParams() requires a Suspense boundary in the App Router —
// without one, a static prerender attempt bails out of the route and
// Next.js logs a build warning. This mirrors reset-password/page.tsx.
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailInner />
    </Suspense>
  );
}
