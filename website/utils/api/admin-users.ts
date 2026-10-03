import { $fetch } from "@/utils/fetch";

/**
 * Root-only. Toggle whether a user is in the recipient list for
 * "new order" notifications. Backend enforces root role — a regular
 * admin gets a 403 here.
 */
export async function setOrderNotifications(
  userId: string,
  enabled: boolean,
): Promise<void> {
  const res = await $fetch(
    `/api/v1/admin/users/${encodeURIComponent(userId)}/order-notifications`,
    {
      method: "PUT",
      body: JSON.stringify({ enabled }),
      headers: { "Content-Type": "application/json" },
      isToast: false,
    },
  );
  if (!res?.response?.ok) {
    throw new Error(res?.json?.detail || "Failed to update order notifications");
  }
}
