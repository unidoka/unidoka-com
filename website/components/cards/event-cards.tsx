"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import {
  ArrowUpRightIcon,
  CalendarBlankIcon,
  MapPinIcon,
  StarIcon,
} from "@phosphor-icons/react";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────────────────── */

export interface CardEventData {
  title: string;
  shortDescription?: string | null;
  coverUrl?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  location?: string | null;
  organizerName?: string | null;
  organizerColor?: string | null;
  typeLabel?: string | null;
  isFeatured?: boolean;
  href?: string;
}

/* ═════════════════════════════════════════════════════════════════
   VARIANT A — EDITORIAL (premium)
   ─────────────────────────────────────────────────────────────────
   Full-bleed cover with the copy sitting on a gradient scrim at the
   bottom. Magazine-cover composition: one strong image, one clear
   title, restrained metadata. No badge row, no dividers, no chrome.
   The only surface detail is the frosted pill in the corner and a
   hairline border that lights up on hover.
   ═════════════════════════════════════════════════════════════════ */
export function EventCardEditorial({ event }: { event: CardEventData }) {
  const { lang } = useLanguage();
  const locale = lang === "ru" ? ru : enUS;

  const dateLabel = event.startAt
    ? format(new Date(event.startAt), "d MMM", { locale })
    : null;
  const yearLabel = event.startAt
    ? format(new Date(event.startAt), "yyyy", { locale })
    : null;
  const dot = event.organizerColor ?? "var(--on-bg-low)";

  const inner = (
    <div
      className={cn(
        "group relative aspect-[4/3] w-full overflow-hidden rounded-3xl",
        "border border-(--outline) bg-(--card)",
        "transition-all duration-500",
        "hover:border-(--on-bg-low)",
      )}
    >
      {/* Cover */}
      {event.coverUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={event.coverUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--on-bg-high)_8%,transparent),color-mix(in_srgb,var(--on-bg-high)_2%,transparent))]" />
      )}

      {/* Scrim — bottom two-thirds, gradient from black through to
          fully transparent. Keeps metadata legible on any cover. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t from-black/90 via-black/55 to-transparent"
      />

      {/* Top-left: organizer mark */}
      <div className="absolute left-5 top-5 flex items-center gap-2">
        <span
          aria-hidden
          className="size-2 rounded-full ring-2 ring-black/30"
          style={{ backgroundColor: dot }}
        />
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90 drop-shadow">
          {event.organizerName ?? "Событие"}
        </span>
      </div>

      {/* Top-right: featured star */}
      {event.isFeatured && (
        <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md">
          <StarIcon className="size-3" weight="fill" />
          Featured
        </span>
      )}

      {/* Bottom: title, date, location */}
      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
        {event.typeLabel && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/60 mb-3">
            {event.typeLabel}
          </p>
        )}
        <h3 className="font-heading font-medium text-[1.5rem] md:text-[1.75rem] leading-[1.05] tracking-[-0.02em] mb-4 line-clamp-2 drop-shadow-sm">
          {event.title}
        </h3>
        <div className="flex items-end justify-between gap-4">
          <div className="flex items-center gap-3 text-[12px] text-white/75">
            {dateLabel && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarBlankIcon className="size-3.5" />
                {dateLabel}
                {yearLabel && (
                  <span className="text-white/40"> · {yearLabel}</span>
                )}
              </span>
            )}
            {event.location && (
              <span className="inline-flex items-center gap-1.5 truncate max-w-[180px]">
                <MapPinIcon className="size-3.5 shrink-0" />
                <span className="truncate">{event.location}</span>
              </span>
            )}
          </div>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-md transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
            <ArrowUpRightIcon className="size-3.5" />
          </span>
        </div>
      </div>
    </div>
  );

  return event.href ? (
    <Link href={event.href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

/* ═════════════════════════════════════════════════════════════════
   VARIANT B — STANDARD (functional)
   ─────────────────────────────────────────────────────────────────
   Cover on top, metadata below. Reads like a project card — badge
   row, title, description, hairline footer with date + location.
   ═════════════════════════════════════════════════════════════════ */
export function EventCardStandard({ event }: { event: CardEventData }) {
  const { lang } = useLanguage();
  const locale = lang === "ru" ? ru : enUS;

  const dateLabel = event.startAt
    ? format(new Date(event.startAt), "d MMM yyyy", { locale })
    : "—";
  const dot = event.organizerColor ?? "var(--on-bg-low)";

  const inner = (
    <div
      className={cn(
        "group relative flex w-full flex-col overflow-hidden rounded-3xl",
        "border border-(--outline) bg-(--card)",
        "transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-(--on-bg-low)",
      )}
    >
      {/* Cover — the ONLY place an image preview is shown */}
      <div className="relative aspect-[4/3] overflow-hidden bg-(--bg-disabled)">
        {event.coverUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={event.coverUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, ${dot} 22%, transparent), color-mix(in srgb, ${dot} 4%, transparent))`,
            }}
          />
        )}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
          <span className="size-1.5 rounded-full" style={{ backgroundColor: dot }} />
          {event.organizerName ?? "Событие"}
        </span>
        {event.isFeatured && (
          <span className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/45 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
            ★
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {event.typeLabel && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center rounded-full border border-(--outline) bg-(--bg) px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-(--on-bg-medium)">
              {event.typeLabel}
            </span>
          </div>
        )}

        <h3 className="text-heading-3 leading-tight text-(--on-bg-high) mb-3 line-clamp-2">
          {event.title}
        </h3>

        {event.shortDescription && (
          <p className="text-body-4 text-(--on-bg-medium) leading-relaxed line-clamp-2 mb-5">
            {event.shortDescription}
          </p>
        )}

        <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1.5 border-t border-(--outline) pt-4 text-body-5 text-(--on-bg-low)">
          <span className="inline-flex items-center gap-1.5">
            <CalendarBlankIcon className="size-3.5" />
            {dateLabel}
          </span>
          {event.location && (
            <span className="inline-flex items-center gap-1.5 truncate">
              <MapPinIcon className="size-3.5 shrink-0" />
              <span className="truncate">{event.location}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return event.href ? (
    <Link href={event.href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}
