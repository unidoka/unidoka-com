import { $fetch } from "@/utils/fetch";

export interface ForgotPasswordPayload {
  email: string;
  lang?: "ru" | "en";
}

export interface ResetPasswordPayload {
  token: string;
  new_password: string;
}

export async function forgotPassword(
  payload: ForgotPasswordPayload,
): Promise<void> {
  const res = await $fetch("/api/v1/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
    isToast: false,
  });
  if (!res?.response?.ok) {
    throw new Error(res?.json?.detail || "Не удалось отправить письмо");
  }
}

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<void> {
  const res = await $fetch("/api/v1/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
    isToast: false,
  });
  if (!res?.response?.ok) {
    const detail = res?.json?.detail;
    const msg = Array.isArray(detail) ? detail[0]?.msg : detail;
    throw new Error(msg || "Не удалось сбросить пароль");
  }
}
