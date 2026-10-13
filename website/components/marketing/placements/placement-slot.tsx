"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { XIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { $fetch } from "@/utils/fetch";
import type {
  MarketingPlacement,
  PlacementAction,
  PlacementType,
} from "@/utils/api/marketing";

/**
 * Public renderer for marketing placements.
 *
 * Mount once per page, once per type you want to support:
 *
 *   <PlacementSlot type="top"    page="events" />
 *   <PlacementSlot type="toast"  page="events" />
 *   <PlacementSlot type="dialog" page="events" />
 *   <PlacementSlot type="card"   page="events" />
 *
 * Fetch happens client-side on mount because the visibility rules
 * depend on wall-clock time — a statically-rendered slot would freeze
 * the schedule window and keep showing expired campaigns.
 *
 * Multiple placements can match a single slot. Top and card stack in
 * priority order; toast and dialog render only the highest-priority
 * match (stacked overlays read as a bug, not a feature).
 *
 * Dismissal model
 * ---------------
 * Toast and dialog close with a single click on × — their transient
 * nature already implies "until next visit". Top and card show a small
 * confirmation popover with a "don't show again" checkbox before
 * closing, so the user can dismiss something without permanently
 * hiding it. The checkbox is pre-checked and, for now, always applied
 * as true on confirm — the storage layer doesn't yet distinguish
 * permanent from session-only dismissals, so both paths persist.
 */

const DISMISS_KEY = "placement-dismissed";

function loadDismissed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveDismissed(ids: Set<string>) {
  try {
    localStorage.setItem(DISMISS_KEY, JSON.stringify([...ids]));
  } catch {}
}

export function PlacementSlot({
  type,
  page,
  className,
}: {
  type: PlacementType;
  page: string;
  className?: string;
}) {
  const [placements, setPlacements] = useState<MarketingPlacement[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setDismissed(loadDismissed());
    let cancelled = false;
    (async () => {
      const res = await $fetch(
        `/api/v1/marketing/placements?page=${encodeURIComponent(page)}&placement_type=${type}`,
        { isToast: false },
      );
      if (cancelled) return;
      setPlacements(Array.isArray(res?.json) ? res.json : []);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [page, type]);

  const dismiss = (id: string) => {
    setDismissed((prev) => {
      const next = new Set(prev).add(id);
      saveDismissed(next);
      return next;
    });
  };

  if (!loaded) return null;

  const visible = placements.filter((p) => !dismissed.has(p.id));
  if (visible.length === 0) return null;

  // Floating types don't stack — the API already ordered by priority.
  if (type === "toast") {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        <PlacementRenderer
          placement={visible[0]}
          onDismiss={() => dismiss(visible[0].id)}
        />
      </div>
    );
  }
  if (type === "dialog") {
    return (
      <DialogOverlay
        placement={visible[0]}
        onDismiss={() => dismiss(visible[0].id)}
        className={className}
      />
    );
  }

  // top + card stack vertically.
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {visible.map((p) => (
        <PlacementRenderer
          key={p.id}
          placement={p}
          onDismiss={() => dismiss(p.id)}
        />
      ))}
    </div>
  );
}

/* ── Single placement renderer ───────────────────────────────────── */

function PlacementRenderer({
  placement,
  onDismiss,
  className,
}: {
  placement: MarketingPlacement;
  onDismiss: () => void;
  className?: string;
}) {
  const accent = placement.accent_color || null;
  const isStacked = placement.placement_type === "top";
  const isCard = placement.placement_type === "card";

  const withAccent = accent
    ? { style: { borderLeftWidth: 3, borderLeftColor: accent } }
    : {};

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "group relative",
          isStacked &&
            "flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-(--outline) bg-(--card) p-3 sm:p-4",
          isCard &&
            "flex flex-col rounded-2xl border border-(--outline) bg-(--card) p-4",
        )}
        {...withAccent}
      >
        {placement.image_url && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={placement.image_url}
            alt=""
            className={cn(
              "shrink-0 object-cover rounded-lg",
              isCard ? "w-full aspect-[16/9] mb-3" : "h-16 w-24 sm:w-32",
            )}
          />
        )}

        <div className="min-w-0 flex-1">
          {placement.heading && (
            <p className="text-body-3 font-semibold text-(--on-bg-high) mb-1">
              {placement.heading}
            </p>
          )}
          {placement.body && (
            <p className="text-body-4 text-(--on-bg-medium) leading-snug">
              {placement.body}
            </p>
          )}

          {/* Actions. Zero by default — the admin adds buttons
              explicitly. Rendered right-aligned on the strip, inline
              under the text on cards. */}
          {placement.actions.length > 0 && (
            <div
              className={cn(
                "flex flex-wrap gap-2",
                isStacked ? "mt-2 sm:mt-3" : "mt-4",
              )}
            >
              {placement.actions.map((a, i) => (
                <PlacementActionButton key={i} action={a} />
              ))}
            </div>
          )}
        </div>

        {/* Close affordance. Top + card get a popover with a "don't
            show again" checkbox; toast/dialog use a bare × rendered by
            their own layout below. */}
        <CloseControl placement={placement} onConfirm={onDismiss} />
      </div>
    </div>
  );
}

function PlacementActionButton({ action }: { action: PlacementAction }) {
  const isExternal = /^https?:\/\//i.test(action.url);
  const variant =
    action.variant === "outlined"
      ? "outlined"
      : action.variant === "text"
        ? "text"
        : "filled";
  return (
    <Button size="small" variant={variant as any} asChild>
      {isExternal ? (
        <a href={action.url} target="_blank" rel="noopener noreferrer">
          {action.label}
          <ArrowRightIcon className="size-3.5" />
        </a>
      ) : (
        <Link href={action.url}>
          {action.label}
          <ArrowRightIcon className="size-3.5" />
        </Link>
      )}
    </Button>
  );
}

/* ── Close control with popover for top/card ─────────────────────── */

function CloseControl({
  placement,
  onConfirm,
}: {
  placement: MarketingPlacement;
  onConfirm: () => void;
}) {
  // For now both branches persist. The checkbox reflects the intended
  // behaviour; the storage layer just hasn't grown a session-only mode
  // yet. See the module docstring.
  const [remember, setRemember] = useState(true);
  const [open, setOpen] = useState(false);

  const closeImmediately = () => {
    // Session-only storage is not implemented — this always persists
    // for now, matching the "always true" behaviour of the checkbox.
    onConfirm();
  };

  const confirmClose = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <div className="absolute top-2 right-2 z-10">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Закрыть"
            className={cn(
              "flex size-7 items-center justify-center rounded-full",
              "text-(--on-bg-low) hover:bg-(--state-hover) hover:text-(--on-bg-high)",
              "transition-colors",
            )}
          >
            <XIcon className="size-3.5" weight="bold" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={6}
          className="w-64 p-3"
        >
          <p className="text-body-4 font-medium text-(--on-bg-high) mb-2">
            Скрыть размещение?
          </p>
          <label className="flex items-start gap-2.5 cursor-pointer mb-3">
            <Checkbox
              checked={remember}
              onCheckedChange={(v) => setRemember(v === true)}
              className="mt-0.5 shrink-0"
            />
            <span className="text-body-5 text-(--on-bg-medium) leading-snug">
              Не показывать больше
            </span>
          </label>
          <div className="flex justify-end gap-1.5">
            <Button
              variant="text"
              size="small"
              onClick={() => setOpen(false)}
            >
              Отмена
            </Button>
            <Button size="small" onClick={confirmClose}>
              Скрыть
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/* ── Dialog overlay ──────────────────────────────────────────────── */

function DialogOverlay({
  placement,
  onDismiss,
  className,
}: {
  placement: MarketingPlacement;
  onDismiss: () => void;
  className?: string;
}) {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  const close = () => {
    setOpen(false);
    onDismiss();
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] flex items-center justify-center p-4",
        className,
      )}
    >
      {/* Backdrop — click to close, same as the × button. */}
      <button
        type="button"
        aria-label="Закрыть"
        onClick={close}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative flex w-full max-w-lg flex-col rounded-2xl border border-(--outline) bg-(--card) p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Закрыть"
          className="absolute top-3 right-3 flex size-7 items-center justify-center rounded-full text-(--on-bg-low) hover:bg-(--state-hover) hover:text-(--on-bg-high) transition-colors"
        >
          <XIcon className="size-4" weight="bold" />
        </button>

        {placement.image_url && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={placement.image_url}
            alt=""
            className="w-full aspect-[16/9] object-cover rounded-lg mb-4"
          />
        )}
        {placement.heading && (
          <p className="text-heading-2 text-(--on-bg-high) mb-2 pr-8">
            {placement.heading}
          </p>
        )}
        {placement.body && (
          <p className="text-body-4 text-(--on-bg-medium) leading-relaxed mb-4">
            {placement.body}
          </p>
        )}
        {placement.actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {placement.actions.map((a, i) => (
              <PlacementActionButton key={i} action={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
