"use client";
import { useMemo, useState } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import ProjectCard from "@/components/layout/projects/project-card";
import type { Solution } from "@/utils/api/solutions";
import type { Project } from "@/app/_data/projects";
import {
  MagnifyingGlassIcon,
  XIcon,
  SlidersHorizontalIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";

// Map Solution to Project so we can reuse the identical ProjectCard
function mapSolutionToProject(s: Solution): Project {
  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    shortDescription: s.short_description || undefined,
    cover: {
      imageSrc: s.cover_image_src || "",
      videoSrc: s.cover_video_src || undefined,
    },
    category: s.category || "",
    clientId: s.client_id || "",
    period: s.period || undefined,
    techStack: s.tech_stack,
    tags: (s.tags || []).map((t) => ({ title: t.title })),
    // isFeatured: s.is_featured,
  };
}

export function SolutionFilterBar({
  solutions,
}: {
  solutions: Solution[];
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activePeriod, setActivePeriod] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Extract categories, periods, and tags from the solutions dynamically
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const s of solutions) if (s.category) set.add(s.category);
    return Array.from(set).sort();
  }, [solutions]);

  const periods = useMemo(() => {
    const set = new Set<string>();
    for (const s of solutions) if (s.period) set.add(s.period);
    return Array.from(set).sort().reverse();
  }, [solutions]);

  const tags = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of solutions) {
      for (const t of s.tags || []) {
        if (!t.title) continue;
        map.set(t.title, (map.get(t.title) || 0) + 1);
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [solutions]);

  const featuredCount = useMemo(
    () => solutions.filter((s) => s.is_featured).length,
    [solutions],
  );

  // Filtering logic
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return solutions.filter((s) => {
      if (activeCategory && s.category !== activeCategory) return false;
      if (activePeriod && s.period !== activePeriod) return false;
      if (featuredOnly && !s.is_featured) return false;
      if (activeTag) {
        const has = (s.tags || []).some((t) => t.title === activeTag);
        if (!has) return false;
      }
      if (q) {
        const haystack = [s.title, s.short_description, s.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [solutions, activeCategory, activePeriod, activeTag, featuredOnly, search]);

  const activeFilterCount =
    (activeCategory ? 1 : 0) +
    (activePeriod ? 1 : 0) +
    (activeTag ? 1 : 0) +
    (featuredOnly ? 1 : 0);
  const hasActiveFilters = !!search.trim() || activeFilterCount > 0;

  const resetAll = () => {
    setSearch("");
    setActiveCategory(null);
    setActivePeriod(null);
    setActiveTag(null);
    setFeaturedOnly(false);
  };

  // Live counts for drawer chips
  const liveCategoryCount = (code: string | null) => {
    const q = search.trim().toLowerCase();
    return solutions.filter((s) => {
      if (code !== null && s.category !== code) return false;
      if (activePeriod && s.period !== activePeriod) return false;
      if (featuredOnly && !s.is_featured) return false;
      if (activeTag && !(s.tags || []).some((t) => t.title === activeTag)) return false;
      if (q) {
        const h = [s.title, s.short_description, s.description].filter(Boolean).join(" ").toLowerCase();
        if (!h.includes(q)) return false;
      }
      return true;
    }).length;
  };

  const livePeriodCount = (period: string | null) => {
    const q = search.trim().toLowerCase();
    return solutions.filter((s) => {
      if (period !== null && s.period !== period) return false;
      if (activeCategory && s.category !== activeCategory) return false;
      if (featuredOnly && !s.is_featured) return false;
      if (activeTag && !(s.tags || []).some((t) => t.title === activeTag)) return false;
      if (q) {
        const h = [s.title, s.short_description, s.description].filter(Boolean).join(" ").toLowerCase();
        if (!h.includes(q)) return false;
      }
      return true;
    }).length;
  };

  const liveTagCount = (label: string) => {
    const q = search.trim().toLowerCase();
    return solutions.filter((s) => {
      if (!(s.tags || []).some((t) => t.title === label)) return false;
      if (activeCategory && s.category !== activeCategory) return false;
      if (activePeriod && s.period !== activePeriod) return false;
      if (featuredOnly && !s.is_featured) return false;
      if (q) {
        const h = [s.title, s.short_description, s.description].filter(Boolean).join(" ").toLowerCase();
        if (!h.includes(q)) return false;
      }
      return true;
    }).length;
  };

  const categoryChips = useMemo(
    () => [
      { id: "__all__", label: "Все", active: activeCategory === null },
      ...categories.map((c) => ({
        id: c,
        label: c,
        active: activeCategory === c,
      })),
    ],
    [categories, activeCategory],
  );

  const activeCategoryLabel = activeCategory
    ? categoryChips.find((c) => c.id === activeCategory)?.label ?? activeCategory
    : null;

  return (
    <>
      <div className="pb-10">
        <Container>
          <h1 className="mt-6 font-heading font-medium tracking-[-0.04em] leading-[0.95] text-[2.75rem] md:text-[4.5rem] mb-6 text-(--on-bg-high)">
            Решения от навыков до сложных систем
          </h1>
          <div className="flex flex-col gap-4">
            <div className="flex items-stretch gap-2">
              <div className="relative flex-1 min-w-0 group">
                <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-(--on-bg-low) pointer-events-none transition-colors group-focus-within:text-(--primary)" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск по решениям..."
                  inputMode="search"
                  autoComplete="off"
                  spellCheck={false}
                  className={cn(
                    "w-full h-11 pl-10 pr-10 bg-transparent rounded-xl",
                    "border border-(--outline) text-body-3 text-(--on-bg-high)",
                    "placeholder:text-(--on-bg-low)",
                    "transition-all duration-200 outline-none",
                    "hover:border-(--on-bg-low)/40",
                    "focus:border-(--primary)",
                    "focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary),transparent_90%)]",
                  )}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Очистить"
                    className="absolute right-2 top-1/2 -translate-y-1/2 size-7 inline-flex items-center justify-center rounded-full text-(--on-bg-low) hover:text-(--on-bg-high) hover:bg-(--state-hover) transition-colors"
                  >
                    <XIcon className="size-3.5" />
                  </button>
                )}
              </div>
              <Button
                onClick={() => setDrawerOpen(true)}
                variant={activeFilterCount > 0 ? "filled" : "outlined"}
                className="h-11! shrink-0 px-3 sm:px-4 gap-2"
              >
                <SlidersHorizontalIcon
                  className="size-4"
                  weight={activeFilterCount > 0 ? "bold" : "regular"}
                />
                <span className="hidden sm:inline">Фильтры</span>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-(--on-primary)/25 text-(--on-primary) text-[10px] font-bold tabular-nums">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              <div className="hidden lg:flex items-center shrink-0 pl-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--on-bg-low) tabular-nums">
                  {filtered.length}
                  <span className="mx-1.5 opacity-40">/</span>
                  {solutions.length}
                </span>
              </div>
            </div>
            <AnimatePresence initial={false}>
              {activeFilterCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {activeCategory && (
                      <RemovableChip
                        label={activeCategoryLabel ?? activeCategory}
                        onRemove={() => setActiveCategory(null)}
                      />
                    )}
                    {activePeriod && (
                      <RemovableChip
                        label={activePeriod}
                        onRemove={() => setActivePeriod(null)}
                      />
                    )}
                    {featuredOnly && (
                      <RemovableChip
                        label="Избранные"
                        onRemove={() => setFeaturedOnly(false)}
                      />
                    )}
                    {activeTag && (
                      <RemovableChip
                        label={activeTag}
                        onRemove={() => setActiveTag(null)}
                      />
                    )}
                    <button
                      type="button"
                      onClick={resetAll}
                      className="ml-1 text-body-5 text-(--on-bg-low) hover:text-(--on-bg-high) transition-colors underline-offset-4 hover:underline"
                    >
                      Очистить всё
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Container>
      </div>

      <section className="pb-24 md:pb-32">
        <Container>
          {filtered.length === 0 ? (
            <div className="py-32 text-center">
              <p className="text-2xl font-heading font-medium text-(--on-bg-medium) mb-4">
                {solutions.length === 0
                  ? "Здесь пока нет решений"
                  : "Ничего не найдено"}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAll}
                  className="text-sm font-medium text-(--primary) underline underline-offset-4 hover:opacity-80 transition-opacity"
                >
                  Сбросить фильтры
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((s, idx) => (
                <ProjectCard
                  key={s.id}
                  project={mapSolutionToProject(s)}
                  index={idx}
                  variant="featured"
                  tags={(s.tags || [])
                    .filter((t) => t.title)
                    .map((t, i) => ({
                      id: `${s.slug}-tag-${i}`,
                      label: t.title,
                    }))}
                />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Filters Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full sm:max-w-md p-0 gap-0 flex flex-col"
        >
          <SheetHeader className="px-6 py-5 border-b border-(--outline) shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <SheetTitle className="flex items-center gap-2.5 text-heading-2 tracking-tight">
                  <SlidersHorizontalIcon className="size-5 shrink-0" weight="bold" />
                  Фильтры
                </SheetTitle>
                <SheetDescription className="text-body-4 text-(--on-bg-low) mt-1 tabular-nums">
                  {filtered.length} из {solutions.length} решений
                </SheetDescription>
              </div>
              <SheetClose asChild>
                <Button
                  variant="text"
                  size="icon-small"
                  className="shrink-0 -mr-2"
                  aria-label="Закрыть"
                >
                  <XIcon className="size-4" />
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto scrollbar-admin">
            <div className="px-6 py-6 space-y-8">
              {categoryChips.length > 1 && (
                <FilterSection title="Категория">
                  {categoryChips.map((c) => {
                    const code = c.id === "__all__" ? null : c.id;
                    const count = liveCategoryCount(code);
                    return (
                      <DrawerChip
                        key={c.id}
                        label={c.label}
                        count={count}
                        active={c.active}
                        disabled={count === 0 && !c.active}
                        onClick={() => setActiveCategory(c.active ? null : code)}
                      />
                    );
                  })}
                </FilterSection>
              )}
              {periods.length > 1 && (
                <FilterSection title="Период">
                  {periods.map((p) => {
                    const count = livePeriodCount(p);
                    const active = activePeriod === p;
                    return (
                      <DrawerChip
                        key={p}
                        label={p}
                        count={count}
                        active={active}
                        disabled={count === 0 && !active}
                        onClick={() => setActivePeriod(active ? null : p)}
                      />
                    );
                  })}
                </FilterSection>
              )}
              {featuredCount > 0 && (
                <FilterSection title="Особенности">
                  <DrawerChip
                    label="Только избранные"
                    count={featuredCount}
                    active={featuredOnly}
                    onClick={() => setFeaturedOnly((v) => !v)}
                  />
                </FilterSection>
              )}
              {tags.length > 0 && (
                <FilterSection title="Теги">
                  {tags.map(([label, count]) => {
                    const active = activeTag === label;
                    return (
                      <DrawerChip
                        key={label}
                        label={label}
                        count={liveTagCount(label)}
                        active={active}
                        disabled={count === 0 && !active}
                        onClick={() => setActiveTag(active ? null : label)}
                      />
                    );
                  })}
                </FilterSection>
              )}
              {categoryChips.length <= 1 &&
                periods.length <= 1 &&
                featuredCount === 0 &&
                tags.length === 0 && (
                  <p className="text-body-4 text-(--on-bg-low) text-center py-12">
                    Пока нет фильтров, которые можно применить.
                  </p>
                )}
            </div>
          </div>
          <SheetFooter className="px-6 py-4 border-t border-(--outline) shrink-0 flex-row gap-2">
            <Button
              variant="outlined"
              onClick={resetAll}
              disabled={!hasActiveFilters}
              className="flex-1 h-11"
            >
              Сбросить
            </Button>
            <Button
              onClick={() => setDrawerOpen(false)}
              className="flex-1 h-11"
            >
              Показать {filtered.length}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h4 className="text-[11px] uppercase tracking-[0.18em] font-medium text-(--on-bg-low)">
        {title}
      </h4>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

function RemovableChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 h-8 pl-3 pr-1 rounded-full border border-(--outline) text-body-5 font-medium text-(--on-bg-high)">
      <span className="truncate max-w-[240px]">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Убрать фильтр ${label}`}
        className="size-6 inline-flex items-center justify-center rounded-full text-(--on-bg-low) hover:text-(--on-bg-high) hover:bg-(--state-hover) transition-colors"
      >
        <XIcon className="size-3" />
      </button>
    </span>
  );
}

function DrawerChip({
  label,
  count,
  active,
  disabled,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-body-4 font-medium transition-all duration-200",
        active
          ? "bg-(--on-bg-high) text-(--bg) shadow-sm"
          : "bg-(--card) border border-(--outline) text-(--on-bg-medium) hover:border-(--on-bg-low)/40 hover:text-(--on-bg-high)",
        disabled &&
        "opacity-30 cursor-not-allowed hover:border-(--outline) hover:text-(--on-bg-medium)",
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "tabular-nums text-[10px] leading-none",
          active ? "text-(--bg)/60" : "text-(--on-bg-low)",
        )}
      >
        {count}
      </span>
    </button>
  );
}
