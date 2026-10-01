import { $fetch } from "@/utils/fetch";
export interface NotificationPrefs {
  email_enabled: boolean;
  telegram_enabled: boolean;
  telegram_connected: boolean;
  telegram_username: string | null;
  bot_username: string | null;
}
export interface TelegramConnectCode {
  code: string;
  url: string;
  expires_in: number;
}
export async function fetchNotificationPrefs(): Promise<NotificationPrefs> {
  const res = await $fetch("/api/v1/me/notifications", { isToast: false });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to load notification preferences");
  return res.json as NotificationPrefs;
}
export async function updateNotificationPrefs(payload: { email_enabled: boolean; telegram_enabled: boolean }): Promise<NotificationPrefs> {
  const res = await $fetch("/api/v1/me/notifications", {
    method: "PUT",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to save notification preferences");
  return res.json as NotificationPrefs;
}
export async function createTelegramLinkCode(): Promise<TelegramConnectCode> {
  const res = await $fetch("/api/v1/me/notifications/telegram/connect-code", { method: "POST" });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to create link code");
  return res.json as TelegramConnectCode;
}
export async function disconnectTelegram(): Promise<void> {
  const res = await $fetch("/api/v1/me/notifications/telegram", { method: "DELETE" });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to disconnect");
}
