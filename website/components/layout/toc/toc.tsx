"use client";

import { useEffect, useMemo, useState } from "react";
import { ListIcon, XIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface TocHeading {
  id: string;
  text: string;
  level: 1 | 2 | 3;
}

interface TocProps {
  headings: TocHeading[];
  /** Small label above the list. Translated by the caller. */
  label: string;
  /** aria-label for the panel. Translated by the caller. */
  ariaLabel: string;
  /** Sidebar stays pinned until the article ends; floating is the mobile pill. */
  variant?: "floating" | "sidebar";
}

/**
 * Scroll-spy table of contents.
 *
 * Desktop uses a sticky sidebar that stays pinned until its article /
 * solution column ends. Mobile keeps a floating pill pinned to the
 * bottom-right corner. Uses a top-band crossing check (dependency-free)
 * so it stays accurate without IntersectionObserver.
 */
export function Toc({
  headings,
  label,
  ariaLabel,
  variant = "floating",
}: TocProps) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? "");
  const [open, setOpen] = useState(false);

  const headingIds = useMemo(() => headings.map((h) => h.id), [headings]);

  useEffect(() => {
    if (headings.length === 0) return;

    let removeScroll: (() => void) | null = null;
    let observer: MutationObserver | null = null;

    const connect = () => {
      const elements = headingIds
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null);
      if (elements.length === 0) return false;

      const onScroll = () => {
        const band = 120;
        let current = elements[0].id;
        for (const el of elements) {
          const top = el.getBoundingClientRect().top;
          if (top - band <= 0) current = el.id;
          else break;
        }
        setActiveId(current);
      };

      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      removeScroll = () => window.removeEventListener("scroll", onScroll);
      return true;
    };

    // The article is client-rendered (Tiptap), so headings may appear a
    // tick after this effect runs. Keep watching until they do.
    if (!connect()) {
      observer = new MutationObserver(() => {
        if (connect()) {
          observer?.disconnect();
          observer = null;
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      observer?.disconnect();
      removeScroll?.();
    };
  }, [headingIds, headings.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (headings.length === 0) return null;

  const handleJump = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setOpen(false);
  };

  const activeHeading = headings.find((h) => h.id === activeId);

  if (variant === "sidebar") {
    return (
      <nav
        aria-label={ariaLabel}
        className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2"
      >
        <p className="mb-3 text-body-5 text-(--on-bg-low)">{label}</p>
        <ul className="border-l border-(--outline)">
          {headings.map((h) => {
            const isActive = h.id === activeId;
            return (
              <li key={h.id}>
                <button
                  type="button"
                  onClick={() => handleJump(h.id)}
                  className={cn(
                    "-ml-px block w-full border-l-2 py-1.5 text-left text-body-4 leading-snug transition-colors",
                    h.level === 3 ? "pl-6" : "pl-3",
                    isActive
                      ? "border-(--primary) text-(--primary)"
                      : "border-transparent text-(--on-bg-low) hover:text-(--on-bg-high)",
                  )}
                >
                  {h.text}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <div aria-label={ariaLabel}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="toc-floating-panel"
        className={cn(
          "fixed bottom-24 right-4 z-40 inline-flex items-center gap-2 rounded-full sm:bottom-5",
          "border border-(--outline) bg-(--card) shadow-lg px-4 py-3",
          "text-body-4 text-(--on-bg-high) transition-all active:scale-[0.97]",
          "max-w-[min(80vw,320px)]",
        )}
      >
        <ListIcon className="size-4 shrink-0" />
        <span className="truncate">
          {activeHeading ? activeHeading.text : label}
        </span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          />
          <div
            id="toc-floating-panel"
            role="dialog"
            aria-label={ariaLabel}
            className={cn(
              "fixed bottom-44 right-4 z-50 w-[min(88vw,360px)] max-h-[60vh] overflow-y-auto scrollbar-admin sm:bottom-20",
              "rounded-2xl border border-(--outline) bg-(--card) shadow-2xl p-3",
              "animate-in fade-in slide-in-from-bottom-2 duration-200",
            )}
          >
            <div className="flex items-center justify-between px-2 py-1.5 mb-1">
              <p className="text-body-5 uppercase tracking-[0.25em] text-(--on-bg-low)">
                {label}
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-(--on-bg-low) hover:text-(--on-bg-high)"
                aria-label="Закрыть содержание"
              >
                <XIcon className="size-4" />
              </button>
            </div>
            <ul className="space-y-0.5">
              {headings.map((h) => {
                const isActive = h.id === activeId;
                return (
                  <li key={h.id}>
                    <button
                      type="button"
                      onClick={() => handleJump(h.id)}
                      className={cn(
                        "text-left w-full leading-snug py-2 px-3 rounded-lg transition-colors",
                        h.level === 1 && "font-medium",
                        h.level === 3 && "pl-6 text-body-5",
                        isActive
                          ? "bg-(--primary-glass) text-(--primary)"
                          : "text-(--on-bg-medium) hover:bg-(--state-hover)",
                      )}
                    >
                      {h.text}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
