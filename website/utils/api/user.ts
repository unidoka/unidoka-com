import { $fetch } from "@/utils/fetch";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  surname: string;
  phone: string;
  description: string;
  avatar_url: string;
  role: string;
  verified: boolean;
  blocked: boolean;
}

export async function updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  const res = await $fetch("/api/v1/me", {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
  return res?.json;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await $fetch("/api/v1/me/change-password", {
    method: "POST",
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    headers: { "Content-Type": "application/json" },
  });
}
