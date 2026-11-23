"use client";
import { useEffect, useMemo, useState } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import ProjectCard from "@/components/layout/projects/project-card";
import {
  fetchPublicSolutionsClient,
  type Solution,
} from "@/utils/api/solutions";
import { solutionToProject } from "@/utils/solution-to-project";
import {
  MagnifyingGlassIcon,
  XIcon,
  SlidersHorizontalIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { SolutionsSearchDialog } from "./solutions-search-dialog";

export function SolutionFilterBar({
  solutions,
}: {
  solutions: Solution[];
}) {
  const [items, setItems] = useState<Solution[]>(solutions);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activePeriod, setActivePeriod] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setItems(solutions);
  }, [solutions]);

  // The RSC fetch can fail (internal URL misconfigured, backend briefly
  // down) and resolves to []. Fall back to the same-origin public API so
  // the page still fills in instead of showing a permanent empty state.
  useEffect(() => {
    if (solutions.length > 0) return;
    let cancelled = false;
    fetchPublicSolutionsClient()
      .then((next) => {
        if (!cancelled && next.length > 0) setItems(next);
      })
      .catch(() => {
        /* empty state is still valid */
      });
    return () => {
      cancelled = true;
    };
  }, [solutions.length]);

  // Extract categories, periods, and tags from the solutions dynamically
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const s of items) if (s.category) set.add(s.category);
    return Array.from(set).sort();
  }, [items]);

  const periods = useMemo(() => {
    const set = new Set<string>();
    for (const s of items) if (s.period) set.add(s.period);
    return Array.from(set).sort().reverse();
  }, [items]);

  const tags = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of items) {
      for (const t of s.tags || []) {
        if (!t.title) continue;
        map.set(t.title, (map.get(t.title) || 0) + 1);
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [items]);

  const featuredCount = useMemo(
    () => items.filter((s) => s.is_featured).length,
    [items],
  );

  // Filtering logic
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((s) => {
      if (activeCategory && s.category !== activeCategory) return false;
      if (activePeriod && s.period !== activePeriod) return false;
      if (featuredOnly && !s.is_featured) return false;
      if (activeTag) {
        const has = (s.tags || []).some((t) => t.title === activeTag);
        if (!has) return false;
      }
      if (q) {
        const haystack = [
          s.title,
          s.short_description,
          s.category,
          s.period,
          ...(s.tags || []).map((t) => t.title),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [items, activeCategory, activePeriod, activeTag, featuredOnly, query]);

  const recommended = useMemo(
    () => items.filter((s) => s.is_featured).slice(0, 3),
    [items],
  );

  const activeFilterCount =
    (activeCategory ? 1 : 0) +
    (activePeriod ? 1 : 0) +
    (activeTag ? 1 : 0) +
    (featuredOnly ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;
  const hasQuery = query.trim().length > 0;
  const showRecommended = !hasActiveFilters && !hasQuery && recommended.length > 0;
  const gridItems = showRecommended
    ? filtered.filter((s) => !s.is_featured)
    : filtered;

  const resetAll = () => {
    setActiveCategory(null);
    setActivePeriod(null);
    setActiveTag(null);
    setFeaturedOnly(false);
    setQuery("");
  };

  // Live counts for drawer chips

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
      <div>
        <Container>
          <div className="flex flex-col gap-3 pb-6 sm:flex-row sm:items-center sm:gap-4 sm:pb-8">
            <h1 className="text-display-3 leading-[1.05] sm:mr-auto">Наши решения</h1>

            <div className="flex items-center gap-2">
              <div className="relative min-w-0 flex-1 sm:w-[220px] lg:w-[280px]">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-(--on-bg-low)" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Поиск решений…"
                  aria-label="Поиск решений"
                  className="h-8 w-full rounded-lg border border-(--outline) bg-transparent pl-8 pr-14 text-body-5 text-(--on-bg-high) outline-none transition-colors placeholder:text-(--on-bg-low) focus:border-(--on-bg-low)/40"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Очистить поиск"
                    className="absolute right-1.5 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-(--on-bg-low) transition-colors hover:text-(--on-bg-high)"
                  >
                    <XIcon className="size-3.5" />
                  </button>
                ) : (
                  <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-(--outline) bg-(--card) px-1.5 py-0.5 font-mono text-[10px] text-(--on-bg-low)">
                    ⌘K
                  </kbd>
                )}
              </div>

              <Button
                onClick={() => setDrawerOpen(true)}
                variant={activeFilterCount > 0 ? "filled" : "text"}
                size="small"
                className="h-8! gap-1.5 px-2.5"
              >
                <SlidersHorizontalIcon
                  className="size-4"
                  weight={activeFilterCount > 0 ? "bold" : "regular"}
                />
                <span className="hidden sm:inline">Фильтры</span>
              </Button>

              {(activeFilterCount > 0 || hasQuery) && (
                <button
                  type="button"
                  onClick={resetAll}
                  className="text-body-5 text-(--on-bg-low) underline-offset-4 transition-colors hover:text-(--on-bg-high) hover:underline"
                >
                  Сбросить
                </button>
              )}
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
                <div className="flex flex-wrap items-center gap-1.5 pb-6">
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Container>

      <section className="pt-8 pb-24 md:pb-32">
        <Container>
          {showRecommended && (
            <div className="mb-12">
              <h2 className="mb-5 text-heading-2">Рекомендуем</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {recommended.map((s, idx) => (
                  <ProjectCard
                    key={s.id}
                    project={solutionToProject(s)}
                    index={idx}
                    variant="clean"
                    href={`/solutions/${s.slug}`}
                    tags={(s.tags || [])
                      .filter((t) => t.title)
                      .map((t, i) => ({
                        id: `${s.slug}-rec-tag-${i}`,
                        label: t.title,
                      }))}
                  />
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="py-32 text-center">
              <p className="mb-4 text-heading-2 text-(--on-bg-medium)">
                {items.length === 0
                  ? "Здесь пока нет решений"
                  : "Ничего не найдено"}
              </p>
              {(hasActiveFilters || hasQuery) && (
                <button
                  type="button"
                  onClick={resetAll}
                  className="text-sm  text-(--primary) underline underline-offset-4 hover:opacity-80 transition-opacity"
                >
                  Сбросить фильтры
                </button>
              )}
            </div>
          ) : gridItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {gridItems.map((s, idx) => (
                <ProjectCard
                  key={s.id}
                  project={solutionToProject(s)}
                  index={idx}
                  variant="clean"
                  href={`/solutions/${s.slug}`}
                  tags={(s.tags || [])
                    .filter((t) => t.title)
                    .map((t, i) => ({
                      id: `${s.slug}-tag-${i}`,
                      label: t.title,
                    }))}
                />
              ))}
            </div>
          ) : null}
        </Container>
      </section>
      </div>

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
                    return (
                      <DrawerChip
                        key={c.id}
                        label={c.label}
                        active={c.active}
                        onClick={() => setActiveCategory(c.active ? null : code)}
                      />
                    );
                  })}
                </FilterSection>
              )}
              {periods.length > 1 && (
                <FilterSection title="Период">
                  {periods.map((p) => {
                    const active = activePeriod === p;
                    return (
                      <DrawerChip
                        key={p}
                        label={p}
                        active={active}
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
                    active={featuredOnly}
                    onClick={() => setFeaturedOnly((v) => !v)}
                  />
                </FilterSection>
              )}
              {tags.length > 0 && (
                <FilterSection title="Теги">
                  {tags.map(([label]) => {
                    const active = activeTag === label;
                    return (
                      <DrawerChip
                        key={label}
                        label={label}
                        active={active}
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
              Показать
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <SolutionsSearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        solutions={items}
      />
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
      <h4 className="text-[11px] uppercase tracking-[0.18em]  text-(--on-bg-low)">
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
    <span className="inline-flex items-center gap-1 h-8 pl-3 pr-1 rounded-full border border-(--outline) text-body-5  text-(--on-bg-high)">
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
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-body-4  transition-all duration-200",
        active
          ? "bg-(--on-bg-high) text-(--bg) shadow-sm"
          : "bg-(--card) border border-(--outline) text-(--on-bg-medium) hover:border-(--on-bg-low)/40 hover:text-(--on-bg-high)",
      )}
    >
      <span>{label}</span>
    </button>
  );
}
