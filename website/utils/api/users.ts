import type { EventListItem } from "@/utils/api/events";

const SERVER_API_BASE =
  process.env.API_BASE_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";

export interface PublicUser {
  id: string;
  username: string | null;
  name: string | null;
  surname: string | null;
  description: string | null;
  avatar_url: string | null;
  telegram_username: string | null;
  github_url: string | null;
  role: string;
  verified: boolean;
  created_at: string | null;
}

/* ── Server-side (RSC) ─────────────────────────────────────────── */
export async function fetchUserByUsernameServer(
  username: string,
): Promise<PublicUser | null> {
  try {
    const res = await fetch(
      `${SERVER_API_BASE}/api/v1/users/by-username/${encodeURIComponent(username)}`,
      { next: { revalidate: 60, tags: [`user:${username}`] } } as any,
    );
    if (!res.ok) return null;
    return (await res.json()) as PublicUser;
  } catch {
    return null;
  }
}

export async function fetchUserEventsServer(
  username: string,
): Promise<EventListItem[]> {
  try {
    const res = await fetch(
      `${SERVER_API_BASE}/api/v1/events?submitted_by_username=${encodeURIComponent(username)}&limit=50`,
      { next: { revalidate: 60, tags: [`events`, `user:${username}`] } } as any,
    );
    if (!res.ok) return [];
    const body = await res.json();
    return Array.isArray(body) ? (body as EventListItem[]) : [];
  } catch {
    return [];
  }
}
