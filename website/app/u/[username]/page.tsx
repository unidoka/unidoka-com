import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  fetchUserByUsernameServer,
  fetchUserEventsServer,
} from "@/utils/api/users";
import { UserProfile } from "./_components/user-profile";

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
  const siteUrl =
    process.env.NEXT_PUBLIC_ROOT_DOMAIN
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
  if (!user) notFound();
  const events = await fetchUserEventsServer(user.username ?? username);
  return <UserProfile user={user} events={events} />;
}
