import { $fetch } from "@/utils/fetch";

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  surname: string | null;
  username: string | null;
  phone: string | null;
  description: string | null;
  avatar_url: string | null;
  telegram_username: string | null;
  github_url: string | null;
  role: string;
  verified: boolean;
  blocked: boolean;
}

export interface UpdateProfilePayload {
  name?: string;
  surname?: string;
  username?: string;
  phone?: string;
  description?: string;
  avatar_url?: string;
  telegram_username?: string;
  github_url?: string;
}

export async function updateProfile(data: UpdateProfilePayload): Promise<UserProfile> {
  const res = await $fetch("/api/v1/me", {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
    isToast: false,
  });
  if (!res?.response?.ok) {
    const detail = res?.json?.detail;
    const msg = Array.isArray(detail)
      ? detail[0]?.msg || "Не удалось сохранить профиль"
      : detail || "Не удалось сохранить профиль";
    throw new Error(msg);
  }
  return res.json as UserProfile;
}

export async function changePassword(current: string, next: string): Promise<void> {
  const res = await $fetch("/api/v1/me/change-password", {
    method: "POST",
    body: JSON.stringify({ current_password: current, new_password: next }),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Password change failed");
}

export async function deleteAccount(): Promise<void> {
  const res = await $fetch("/api/v1/me", { method: "DELETE" });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Delete failed");
}
