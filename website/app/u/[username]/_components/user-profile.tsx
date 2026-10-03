"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ru as ruLocale, enUS } from "date-fns/locale";
import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  CalendarBlankIcon,
  CheckCircleIcon,
  GithubLogo,
  MapPinIcon,
  TelegramLogo,
} from "@phosphor-icons/react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { colorForOrganizer } from "@/app/events/_components/organizer-meta";
import { useLanguage } from "@/providers/language-provider";
import type { PublicUser } from "@/utils/api/users";
import type { EventListItem } from "@/utils/api/events";
import { cn } from "@/lib/utils";

interface Props {
  user: PublicUser;
  events: EventListItem[];
}

export function UserProfile({ user, events }: Props) {
  const { t, lang } = useLanguage();
  const locale = lang === "ru" ? ruLocale : enUS;

  const fullName = [user.name, user.surname].filter(Boolean).join(" ").trim();
  const display = fullName || (user.username ? "@" + user.username : "—");
  const initials = initialsOf(user, display);
  const handle = user.username ? "@" + user.username : null;
  const joined = user.created_at
    ? format(new Date(user.created_at), "d MMMM yyyy", { locale })
    : null;

  const ghUrl =
    user.github_url ??
    (user.username ? `https://github.com/${user.username}` : null);
  const tgUrl = user.telegram_username
    ? `https://t.me/${user.telegram_username.replace(/^@/, "")}`
    : null;

  const publishedCount = events.length;
  const upcomingCount = events.filter((e) => {
    if (!e.start_at) return false;
    return new Date(e.start_at).getTime() >= Date.now();
  }).length;

  return (
    <main className="min-h-screen bg-(--bg)">
      {/* ─── HERO ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-(--outline)">
        {/* Blueprint grid, masked to the top */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--on-bg-high) 1px, transparent 1px), linear-gradient(to bottom, var(--on-bg-high) 1px, transparent 1px)",
            backgroundSize: "96px 96px",
            maskImage:
              "radial-gradient(ellipse 80% 55% at 50% 0%, black 20%, transparent 90%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 55% at 50% 0%, black 20%, transparent 90%)",
          }}
        />
        {/* Soft bloom */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 55% 45% at 50% 5%, color-mix(in srgb, var(--on-bg-high), transparent 93%), transparent 70%)",
          }}
        />

        <Container className="relative pt-32 md:pt-40 pb-14 md:pb-20">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-body-5 uppercase tracking-[0.24em] text-(--on-bg-low) hover:text-(--primary) transition-colors mb-10"
          >
            <ArrowLeftIcon className="size-3.5" />
            {t("profile.back")}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-8 md:gap-14 items-start">
            {/* Avatar tile */}
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-3 rounded-[2rem] opacity-40 blur-2xl"
                style={{
                  background:
                    "radial-gradient(circle, color-mix(in srgb, var(--on-bg-high), transparent 82%) 0%, transparent 70%)",
                }}
              />
              <div className="relative aspect-square w-40 md:w-[220px] rounded-[2rem] border border-(--outline) bg-(--card) overflow-hidden">
                {user.avatar_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={user.avatar_url}
                    alt={display}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-(--on-bg-high) text-(--bg)">
                    <span className="font-heading font-medium text-[3.5rem] md:text-[4.5rem] tracking-tighter leading-none select-none">
                      {initials}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Identity column */}
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-(--on-bg-low) mb-4">
                {t("profile.eyebrow")}
              </p>
              <h1 className="font-heading font-medium tracking-[-0.04em] leading-[0.92] text-[2.75rem] md:text-[4.5rem] lg:text-[5.5rem] text-(--on-bg-high) mb-4 break-words">
                {display}
              </h1>
              {handle && (
                <p className="font-mono text-body-3 md:text-body-2 text-(--on-bg-low) mb-6">
                  {handle}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 mb-6">
                {user.role && (
                  <Badge variant="tonal-card-static" size="chip-medium">
                    {user.role}
                  </Badge>
                )}
                {user.verified && (
                  <Badge
                    variant="tonal-card-static"
                    size="chip-medium"
                    className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                  >
                    <CheckCircleIcon className="size-3.5" weight="fill" />
                    {t("profile.verified")}
                  </Badge>
                )}
                {joined && (
                  <Badge variant="tonal-card-static" size="chip-medium">
                    <CalendarBlankIcon className="size-3.5" />
                    {t("profile.member_since")} · {joined}
                  </Badge>
                )}
              </div>

              <p className="text-body-2 md:text-body-1 text-(--on-bg-medium) leading-relaxed max-w-[640px] mb-8 whitespace-pre-line">
                {user.description?.trim() || t("profile.no_bio")}
              </p>

              {/* Links */}
              <div className="flex flex-wrap gap-2">
                {ghUrl && (
                  <Button variant="outlined" size="medium" shape="round" asChild>
                    <a href={ghUrl} target="_blank" rel="noopener noreferrer">
                      <GithubLogo className="size-4" />
                      {t("profile.link_github")}
                      <ArrowUpRightIcon className="size-3.5" />
                    </a>
                  </Button>
                )}
                {tgUrl && (
                  <Button variant="outlined" size="medium" shape="round" asChild>
                    <a href={tgUrl} target="_blank" rel="noopener noreferrer">
                      <TelegramLogo className="size-4" />
                      {t("profile.link_telegram")}
                      <ArrowUpRightIcon className="size-3.5" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── STATS STRIP ─────────────────────────────────────────── */}
      <section className="border-b border-(--outline)">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-(--outline)">
            <StatCell
              index="01"
              label={t("profile.stats_events")}
              value={String(publishedCount).padStart(2, "0")}
              hint={
                publishedCount === 1
                  ? t("profile.events_count_one")
                  : t("profile.events_count_many")
              }
            />
            <StatCell
              index="02"
              label="Upcoming"
              value={String(upcomingCount).padStart(2, "0")}
              hint="недавних и будущих"
            />
            <StatCell
              index="03"
              label={t("profile.role")}
              value={user.role ?? "user"}
              hint="на платформе"
              monoValue
            />
            <StatCell
              index="04"
              label="Handle"
              value={user.username ? "@" + user.username : "—"}
              hint="уникальный"
              monoValue
            />
          </div>
        </Container>
      </section>

      {/* ─── EVENTS ──────────────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10 pb-6 border-b border-(--outline)">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-(--on-bg-low) mb-3">
                {t("profile.section_events_eyebrow")}
              </p>
              <h2 className="font-heading font-medium tracking-[-0.03em] text-[2rem] md:text-[3rem] text-(--on-bg-high) leading-tight">
                {t("profile.section_events")}
              </h2>
            </div>
            <span className="font-mono text-body-4 tabular-nums text-(--on-bg-low)">
              {String(publishedCount).padStart(2, "0")} /{" "}
              {publishedCount === 1
                ? t("profile.events_count_one")
                : t("profile.events_count_many")}
            </span>
          </div>

          {events.length === 0 ? (
            <Card className="rounded-3xl border border-dashed border-(--outline) bg-transparent ring-0 p-14 text-center">
              <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-(--primary-card) text-(--primary) mb-5">
                <CalendarBlankIcon className="size-6" />
              </div>
              <h3 className="text-heading-3 text-(--on-bg-high) mb-2">
                {t("profile.no_events_title")}
              </h3>
              <p className="text-body-3 text-(--on-bg-medium) max-w-md mx-auto">
                {t("profile.no_events_body")}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {events.map((ev, idx) => (
                <EventCard key={ev.id} event={ev} index={idx} locale={locale} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}

/* ── Stat cell ─────────────────────────────────────────────────────── */

function StatCell({
  index,
  label,
  value,
  hint,
  monoValue,
}: {
  index: string;
  label: string;
  value: string;
  hint: string;
  monoValue?: boolean;
}) {
  return (
    <div className="py-8 md:py-10 px-5 md:px-8 first:pl-0 last:pr-0">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-(--on-bg-low) mb-3">
        {index} · {label}
      </p>
      <p
        className={cn(
          "font-heading font-medium tracking-[-0.03em] leading-none text-(--on-bg-high) mb-3",
          monoValue
            ? "font-mono text-[1.25rem] md:text-[1.5rem] tracking-normal"
            : "text-[2rem] md:text-[2.75rem] tabular-nums",
        )}
      >
        {value}
      </p>
      <p className="text-body-5 text-(--on-bg-low) truncate">{hint}</p>
    </div>
  );
}

/* ── Event card ────────────────────────────────────────────────────── */

function EventCard({
  event,
  index,
  locale,
}: {
  event: EventListItem;
  index: number;
  locale: typeof ruLocale;
}) {
  const color = colorForOrganizer(event.organizer);
  const start = event.start_at ? new Date(event.start_at) : null;
  const end = event.end_at ? new Date(event.end_at) : null;

  const dateLabel = start
    ? end && start.toDateString() !== end.toDateString()
      ? `${format(start, "d MMM", { locale })} — ${format(end, "d MMM yyyy", { locale })}`
      : format(start, "d MMM yyyy", { locale })
    : "—";

  const firstType = event.types?.[0];

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group relative flex flex-col rounded-3xl border border-(--outline) bg-(--card) overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-(--on-bg-high)"
    >
      {/* Cover */}
      <div className="relative aspect-[16/10] overflow-hidden bg-(--bg-disabled)">
        {event.cover_image_src ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={event.cover_image_src}
            alt={event.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, ${color} 22%, transparent), color-mix(in srgb, ${color} 4%, transparent))`,
            }}
          />
        )}
        <span
          aria-hidden
          className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md"
        >
          <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
          {event.organizer?.name ?? "—"}
        </span>
        <span
          aria-hidden
          className="absolute top-3 right-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/70"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col p-5 md:p-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {firstType?.type && (
            <Badge variant="tonal-card-static" size="chip-small">
              {firstType.type.name}
            </Badge>
          )}
          {event.is_featured && (
            <Badge variant="tonal-primary-static" size="chip-small">
              ★
            </Badge>
          )}
        </div>

        <h3 className="text-heading-3 leading-tight text-(--on-bg-high) mb-3 line-clamp-2">
          {event.title}
        </h3>

        {event.short_description && (
          <p className="text-body-4 text-(--on-bg-medium) leading-relaxed line-clamp-2 mb-5">
            {event.short_description}
          </p>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-body-5 text-(--on-bg-low) mt-auto pt-4 border-t border-(--outline)">
          <span className="inline-flex items-center gap-1.5">
            <CalendarBlankIcon className="size-3.5" />
            {dateLabel}
          </span>
          {event.location_name && (
            <span className="inline-flex items-center gap-1.5 truncate">
              <MapPinIcon className="size-3.5 shrink-0" />
              <span className="truncate">{event.location_name}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ── Helpers ───────────────────────────────────────────────────────── */

function initialsOf(user: PublicUser, display: string): string {
  const parts = [user.name, user.surname]
    .filter(Boolean)
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (user.username) return user.username.slice(0, 2).toUpperCase();
  return display.slice(0, 2).toUpperCase();
}
