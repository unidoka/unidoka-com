import { redirect } from "next/navigation";

/**
 * Legacy URL shape `/blog/{id}/{slug}` is reserved for old links.
 * Articles are addressed by slug alone now.
 */
export default async function LegacyArticlePage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/blog/${slug}`);
}
