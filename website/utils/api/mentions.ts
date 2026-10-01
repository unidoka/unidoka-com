import { $fetch } from "@/utils/fetch";
export interface MentionUser { username: string; name?: string | null; avatar_url?: string | null; }
export interface MentionProject { id: string; slug: string; title: string; cover_image_src: string; }
export interface MentionClient { id: string; slug: string; name: string; logotype_url?: string | null; }
export interface MentionResults {
  users: MentionUser[];
  projects: MentionProject[];
  clients: MentionClient[];
}
export async function searchMentions(q: string, limit = 6): Promise<MentionResults> {
  const qs = new URLSearchParams({ q, limit: String(limit) });
  const res = await $fetch(`/api/v1/mentions?${qs}`, { isToast: false });
  return (res?.json as MentionResults) ?? { users: [], projects: [], clients: [] };
}
