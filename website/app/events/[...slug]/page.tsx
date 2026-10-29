import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  ArrowUpRightIcon,
  CalendarBlankIcon,
  ClockIcon,
  MapPinIcon,
  TagIcon,
} from "@phosphor-icons/react/dist/ssr";
import { compileMDX } from "next-mdx-remote/rsc";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchEventServer } from "@/utils/api/events";
import { colorForOrganizer } from "@/app/events/_components/organizer-meta";

export const revalidate = 60;

/**
 * Catch-all route to handle both:
 *   - /events/[id]/[slug]  (new canonical URL)
 *   - /events/[slug]       (legacy URL, redirects to canonical)
 *
 * Next.js forbids having `[slug]` and `[id]` folders side-by-side,
 * so we use `[...slug]` (an array) and branch based on its length.
 */

function absoluteUrl(
  path: string | null | undefined,
  siteUrl: string,
): string | undefined {
  if (!path) return undefined;
  const trimmed = path.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${siteUrl}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}

function siteOrigin(): string {
  const proto = process.env.NEXT_PUBLIC_HTTP_PROTOCOL || "https";
  const rawRoot = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "").trim();
  const cleanRoot = rawRoot.replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
  if (cleanRoot) return `${proto}://${cleanRoot}`;
  return "http://localhost:3000";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  
  // If it's a 1-segment URL (legacy), we'll redirect in the main component.
  // We return a basic title here just in case, but the redirect will fire first.
  if (!slug || slug.length !== 2) return { title: "Событие" };

  const eventSlug = slug[1];
  const event = await fetchEventServer(eventSlug);
  if (!event) return { title: "Событие не найдено" };

  const siteUrl = siteOrigin();
  const title = event.seo_title || event.title;
  const description = event.meta_description || event.short_description || undefined;
  const canonicalUrl = `${siteUrl}/events/${event.id}/${event.slug}`;

  const cover = absoluteUrl(event.cover_image_src, siteUrl);
  const imageUrl = cover ?? `${siteUrl}/og-default.png`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title,
      description,
      siteName: "Unidoka",
      locale: "ru_RU",
      images: [{ url: imageUrl, alt: event.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;

  // Guard against /events or /events/a/b/c
  if (!slug || slug.length === 0 || slug.length > 2) {
    notFound();
  }

  // ── Case 1: Legacy /events/[slug] ────────────────────────────────
  if (slug.length === 1) {
    const legacySlug = slug[0];
    const event = await fetchEventServer(legacySlug);
    if (!event) notFound();
    
    // 307 redirect to the new canonical URL
    redirect(`/events/${event.id}/${event.slug}`);
  }

  // ── Case 2: New /events/[id]/[slug] ──────────────────────────────
  const [id, eventSlug] = slug;
  const event = await fetchEventServer(eventSlug);

  if (!event) {
    // Slug may have been edited. Retry by ID.
    const byId = await fetchEventServer(id);
    if (byId) redirect(`/events/${byId.id}/${byId.slug}`);
    notFound();
  }

  // Slug matched but ID doesn't — user edited the UUID in the URL bar.
  if (event.id !== id) {
    redirect(`/events/${event.id}/${event.slug}`);
  }

  // ── Render ───────────────────────────────────────────────────────
  const color = colorForOrganizer(event.organizer);
  const start = event.start_at ? new Date(event.start_at) : null;
  const end = event.end_at ? new Date(event.end_at) : null;
  const sameDay =
    start && end ? start.toDateString() === end.toDateString() : false;

  const dateLabel = start
    ? sameDay && end
      ? `${format(start, "d MMMM yyyy, HH:mm", { locale: ru })} - ${format(end, "HH:mm")}`
      : end
        ? `${format(start, "d MMMM yyyy", { locale: ru })} - ${format(end, "d MMMM yyyy", { locale: ru })}`
        : format(start, "d MMMM yyyy, HH:mm", { locale: ru })
    : "Дата уточняется";

  const source = event.mdx_content || event.description || "";
  const { content } = await compileMDX({
    source,
    options: { parseFrontmatter: false },
  });

  return (
    <main className="min-h-screen bg-(--bg) pt-24 sm:pt-32 pb-24">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            {event.organizer && (
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider mb-4"
                style={{
                  color,
                  backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
                }}
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {event.organizer.name}
              </div>
            )}
            <h1 className="text-display-2 md:text-display-1 text-(--on-bg-high) leading-[1.05] mb-4">
              {event.title}
            </h1>
            {event.short_description && (
              <p className="text-body-1 text-(--on-bg-medium) leading-relaxed">
                {event.short_description}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-6">
              {(event.types ?? []).map((t) =>
                t.type ? (
                  <Badge key={t.id} variant="tonal-card-static">
                    {t.type.name}
                  </Badge>
                ) : t.custom_name ? (
                  <Badge key={t.id} variant="tonal-card-static">
                    {t.custom_name}
                  </Badge>
                ) : null,
              )}
              {(event.tags ?? []).map((tag) => (
                <Badge key={tag.id} variant="tonal-card-static">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>

          {event.cover_image_src && (
            <div className="relative aspect-[16/9] rounded-3xl overflow-hidden border border-(--outline) mb-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.cover_image_src}
                alt={event.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <MetaCard
              icon={<CalendarBlankIcon className="size-4" />}
              label="Когда"
              value={dateLabel}
            />
            {event.location_name && (
              <MetaCard
                icon={<MapPinIcon className="size-4" />}
                label="Место"
                value={event.location_name}
              />
            )}
            {event.price && (
              <MetaCard
                icon={<TagIcon className="size-4" />}
                label="Цена"
                value={event.price}
              />
            )}
          </div>

          {event.registration_url && (
            <div className="mb-8">
              <Button size="large" shape="round" asChild>
                <Link
                  href={event.registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Зарегистрироваться
                  <ArrowUpRightIcon className="size-4" />
                </Link>
              </Button>
            </div>
          )}

          {source ? (
            <article className="prose prose-neutral dark:prose-invert max-w-none">
              {content}
            </article>
          ) : (
            <p className="text-body-3 text-(--on-bg-medium)">
              Описание пока не добавлено.
            </p>
          )}

          {(event.other_dates ?? []).length > 0 && (
            <section className="mt-12 pt-8 border-t border-(--outline)">
              <h2 className="text-heading-2 mb-4">Дополнительные даты</h2>
              <ul className="space-y-2">
                {(event.other_dates ?? []).map((d, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <ClockIcon className="size-4 text-(--on-bg-low)" />
                    <span className="font-medium">{d.label}</span>
                    <span className="text-body-4 text-(--on-bg-medium)">
                      {format(new Date(d.at), "d MMMM yyyy, HH:mm", {
                        locale: ru,
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </Container>
    </main>
  );
}

function MetaCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-(--outline) bg-(--card) p-4">
      <div className="flex items-center gap-2 mb-1.5 text-(--on-bg-low)">
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-medium">
          {label}
        </span>
      </div>
      <p className="text-body-3 font-medium text-(--on-bg-high)">{value}</p>
    </div>
  );
}
