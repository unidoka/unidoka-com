import { $fetch } from "@/utils/fetch";
export interface AdminNotificationSettings {
  order_notify_email: boolean;
  order_notify_telegram: boolean;
  order_recipient_ids: string[];
  order_email_recipient_ids: string[];
  order_telegram_recipient_ids: string[];
  order_template_subject: string;
  order_template_body: string;
  default_subject: string;
  default_body: string;
}
export async function fetchAdminNotificationSettings(): Promise<AdminNotificationSettings> {
  const res = await $fetch("/api/v1/admin/notification-settings", { isToast: false });
  if (res?.response?.status === 403) throw new Error("Доступ только для root-пользователя");
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Не удалось загрузить настройки");
  return res.json as AdminNotificationSettings;
}
export async function updateAdminNotificationSettings(
  payload: AdminNotificationSettings,
): Promise<AdminNotificationSettings> {
  const res = await $fetch("/api/v1/admin/notification-settings", {
    method: "PUT",
    body: JSON.stringify({
      order_notify_email: payload.order_notify_email,
      order_notify_telegram: payload.order_notify_telegram,
      order_recipient_ids: payload.order_recipient_ids,
      order_email_recipient_ids: payload.order_email_recipient_ids,
      order_telegram_recipient_ids: payload.order_telegram_recipient_ids,
      order_template_subject: payload.order_template_subject,
      order_template_body: payload.order_template_body,
    }),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Не удалось сохранить настройки");
  return res.json as AdminNotificationSettings;
}
