import { $fetch } from "@/utils/fetch";
export interface TeamMemberBrief {
  id: string;
  role: string;
  bio?: string | null;
  cover_url?: string | null;
  sort_order: number;
}
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  surname: string;
  username?: string | null;
  phone: string;
  bio?: string | null;
  avatar_url: string;
  description?: string | null;
  role: string;
  verified: boolean;
  blocked: boolean;
  is_team_member: boolean;
  team_member: TeamMemberBrief | null;
}
export interface UpdateProfilePayload {
  name?: string;
  surname?: string;
  email?: string;
  phone?: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
  team_role?: string;
  team_bio?: string;
  team_cover_url?: string;
}
export async function updateProfile(data: UpdateProfilePayload): Promise<UserProfile> {
  const res = await $fetch("/api/v1/me", {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to update profile");
  return res.json as UserProfile;
}
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await $fetch("/api/v1/me/change-password", {
    method: "POST",
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to change password");
}
export async function deleteAccount(): Promise<void> {
  const res = await $fetch("/api/v1/me", { method: "DELETE" });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to delete account");
}
