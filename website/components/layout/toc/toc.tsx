"use client";

import { useEffect, useMemo, useState } from "react";
import { ListIcon, XIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

interface TocProps {
  headings: TocHeading[];
  /** Small label above the list. Translated by the caller. */
  label: string;
  /** aria-label for the aside. Translated by the caller. */
  ariaLabel: string;
}

/**
 * Scroll-spy TOC. Desktop: sticky sidebar. Mobile: floating button bottom-right
 * that expands into a scrollable panel. Uses a top-band crossing check
 * (dependency-free) so it stays accurate without IntersectionObserver.
 */
export function Toc({ headings, label, ariaLabel }: TocProps) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);

  const headingIds = useMemo(() => headings.map((h) => h.id), [headings]);

  useEffect(() => {
    if (headings.length === 0) return;
    const elements = headingIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

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
    return () => window.removeEventListener("scroll", onScroll);
  }, [headingIds, headings.length]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const handleJump = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  const activeHeading = headings.find((h) => h.id === activeId);

  return (
    <>
      {/* ─── Desktop: sticky sidebar ─────────────────────────────── */}
      <aside
        aria-label={ariaLabel}
        className="hidden lg:block lg:sticky lg:top-32 h-fit"
      >
        <p className="text-body-5 uppercase tracking-[0.25em] text-(--on-bg-low) mb-3">
          {label}
        </p>
        <nav>
          <ul className="space-y-1.5 text-body-4">
            {headings.map((h) => {
              const isActive = h.id === activeId;
              return (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => handleJump(h.id)}
                    className={cn(
                      "text-left w-full leading-snug py-1 transition-colors border-l-2 pl-3",
                      h.level === 3 && "pl-6 text-body-5",
                      isActive
                        ? "border-(--primary) text-(--primary) font-medium"
                        : "border-transparent text-(--on-bg-medium) hover:text-(--on-bg-high) hover:border-(--outline)",
                    )}
                  >
                    {h.text}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* ─── Mobile: floating button + expanding panel ───────────── */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="toc-mobile-panel"
          className={cn(
            "fixed bottom-24 right-4 z-40 inline-flex items-center gap-2 rounded-full",
            "border border-(--outline) bg-(--card) shadow-lg px-4 py-3",
            "text-body-4 font-medium text-(--on-bg-high) transition-all active:scale-[0.97]",
            "max-w-[min(80vw,320px)]",
          )}
        >
          <ListIcon className="size-4 shrink-0" />
          <span className="truncate">
            {activeHeading ? activeHeading.text : label}
          </span>
        </button>

        {mobileOpen && (
          <>
            <button
              type="button"
              aria-hidden
              tabIndex={-1}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            />
            <div
              id="toc-mobile-panel"
              role="dialog"
              aria-label={ariaLabel}
              className={cn(
                "fixed bottom-40 right-4 z-50 w-[min(88vw,360px)] max-h-[55vh] overflow-y-auto scrollbar-admin",
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
                  onClick={() => setMobileOpen(false)}
                  className="text-(--on-bg-low) hover:text-(--on-bg-high)"
                  aria-label="Close"
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
                          h.level === 3 && "pl-6 text-body-5",
                          isActive
                            ? "bg-(--primary-glass) text-(--primary) font-medium"
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
    </>
  );
}
