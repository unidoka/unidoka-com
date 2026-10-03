import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  fetchUserByUsernameServer,
  fetchUserEventsServer,
} from "@/utils/api/users";
import { UserProfile } from "./_components/user-profile";

/**
 * `force-dynamic` is load-bearing here.
 *
 * Without it, Next.js 16.3.8 + Turbopack hits a bug where `notFound()`
 * thrown inside an RSC that just took a cache-hit path (<1ms fetch)
 * makes the RSC timing instrumentation compute a negative duration,
 * surfacing as:
 *   "Failed to execute 'measure' on 'Performance':
 *    'UserPage' cannot have a negative time stamp."
 *
 * Opting the route out of static caching sidesteps the code path. The
 * page still hits our own `revalidate: 60` fetch cache, so the perf
 * cost is negligible for a low-traffic profile route.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const user = await fetchUserByUsernameServer(username);
  if (!user) {
    return { title: "Пользователь не найден · Unidoka" };
  }
  const full = [user.name, user.surname].filter(Boolean).join(" ").trim();
  const display = full || "@" + (user.username ?? username);
  const desc =
    user.description?.slice(0, 155) ||
    `Профиль ${display} на Unidoka — события, публичная активность, ссылки.`;
  const siteUrl = process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : "http://localhost:3000";
  return {
    title: `${display} · Unidoka`,
    description: desc,
    openGraph: {
      title: display,
      description: desc,
      url: `${siteUrl}/u/${user.username ?? username}`,
      type: "profile",
      images: user.avatar_url ? [user.avatar_url] : undefined,
    },
  };
}

export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await fetchUserByUsernameServer(username);
  if (!user) {
    // notFound() is only reached when the backend genuinely says 404.
    // With `force-dynamic` above, that no longer trips the Turbopack
    // timing bug — the page renders a clean 404 instead.
    notFound();
  }
  const events = await fetchUserEventsServer(user.username ?? username);
  return <UserProfile user={user} events={events} />;
}
