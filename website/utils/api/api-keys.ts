import { $fetch } from "@/utils/fetch";

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
}

export interface ApiKeyCreated extends ApiKey {
  full_key: string;
}

export interface AdminApiKey extends ApiKey {
  user_id: string;
  user_email: string;
  user_name: string | null;
}

export async function listMyApiKeys(): Promise<ApiKey[]> {
  const res = await $fetch("/api/v1/me/api-keys", { isToast: false });
  return Array.isArray(res?.json) ? (res.json as ApiKey[]) : [];
}

export async function createMyApiKey(payload: {
  name: string;
  expires_at?: string | null;
}): Promise<ApiKeyCreated> {
  const res = await $fetch("/api/v1/me/api-keys", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
    isToast: false,
  });
  if (!res?.response?.ok) {
    throw new Error(res?.json?.detail || "Не удалось создать ключ");
  }
  return res.json as ApiKeyCreated;
}

export async function revokeMyApiKey(id: string): Promise<void> {
  const res = await $fetch(`/api/v1/me/api-keys/${id}`, {
    method: "DELETE",
    isToast: false,
  });
  if (!res?.response?.ok) {
    throw new Error(res?.json?.detail || "Не удалось отозвать ключ");
  }
}


export async function listAllApiKeys(
  q?: string,
  activeOnly = false,
): Promise<AdminApiKey[]> {
  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  if (activeOnly) qs.set("active_only", "true");
  const res = await $fetch(
    `/api/v1/admin/api-keys${qs.toString() ? "?" + qs.toString() : ""}`,
    { isToast: false },
  );
  return Array.isArray(res?.json) ? (res.json as AdminApiKey[]) : [];
}

export async function revokeAnyApiKey(id: string): Promise<void> {
  const res = await $fetch(`/api/v1/admin/api-keys/${id}`, {
    method: "DELETE",
    isToast: false,
  });
  if (!res?.response?.ok) {
    throw new Error(res?.json?.detail || "Не удалось отозвать");
  }
}
