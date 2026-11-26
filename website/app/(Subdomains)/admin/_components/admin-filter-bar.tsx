"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  MagnifyingGlassIcon,
  SlidersHorizontalIcon,
  XIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface AdminFilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface AdminFilterField {
  id: string;
  label: string;
  value: string;
  /** `value === "all"` means the filter is off. */
  options: AdminFilterOption[];
  onChange: (value: string) => void;
}

interface Props {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder?: string;
  fields?: AdminFilterField[];
  onReset?: () => void;
  /** Extra controls rendered next to the filter button (view toggles etc.). */
  trailing?: ReactNode;
}

/**
 * Admin list toolbar: search with ⌘K, a filter drawer with chip options,
 * and removable active-filter chips below. Same interaction model as the
 * public solutions page, reused by every admin list.
 */
export function AdminFilterBar({
  query,
  onQueryChange,
  placeholder = "Поиск…",
  fields = [],
  onReset,
  trailing,
}: Props) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.code !== "KeyK") return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const activeFields = useMemo(
    () => fields.filter((field) => field.value !== "all"),
    [fields],
  );
  const activeCount = activeFields.length;

  return (
    <Card className="rounded-3xl border-(--outline) p-4 gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-(--on-bg-low)" />
          <Input
            ref={searchRef}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={placeholder}
            className="pl-9 pr-14"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-(--outline) bg-(--bg) px-1.5 py-0.5 font-mono text-[10px] text-(--on-bg-low) sm:block">
            ⌘K
          </kbd>
        </div>

        {fields.length > 0 && (
          <Button
            type="button"
            variant={activeCount > 0 ? "filled" : "outlined"}
            size="small"
            onClick={() => setOpen(true)}
            className="gap-1.5"
          >
            <SlidersHorizontalIcon
              className="size-4"
              weight={activeCount > 0 ? "bold" : "regular"}
            />
            Фильтры
            {activeCount > 0 && (
              <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-white/25 px-1 text-[10px]">
                {activeCount}
              </span>
            )}
          </Button>
        )}

        {trailing}
      </div>

      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {activeFields.map((field) => {
            const option = field.options.find((o) => o.value === field.value);
            return (
              <button
                key={field.id}
                type="button"
                onClick={() => field.onChange("all")}
                className="inline-flex items-center gap-1.5 rounded-full border border-(--outline) px-2.5 py-1 text-body-5 text-(--on-bg-medium) transition-colors hover:border-(--primary)/40 hover:text-(--primary)"
              >
                {field.label}: {option?.label ?? field.value}
                <XIcon className="size-3" />
              </button>
            );
          })}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="ml-1 text-body-5 text-(--on-bg-low) underline-offset-4 transition-colors hover:text-(--on-bg-high) hover:underline"
            >
              Сбросить всё
            </button>
          )}
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
        >
          <SheetHeader className="shrink-0 border-b border-(--outline) px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <SheetTitle className="flex items-center gap-2.5 text-heading-2 tracking-tight">
                <SlidersHorizontalIcon className="size-5 shrink-0" weight="bold" />
                Фильтры
              </SheetTitle>
              <SheetClose asChild>
                <Button
                  variant="text"
                  size="icon-small"
                  className="-mr-2 shrink-0"
                  aria-label="Закрыть"
                >
                  <XIcon className="size-4" />
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>

          <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6">
            {fields.map((field) => (
              <section key={field.id} className="space-y-2.5">
                <h3 className="text-body-4 text-(--on-bg-medium)">
                  {field.label}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {field.options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => field.onChange(option.value)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-body-5 transition-colors",
                        field.value === option.value
                          ? "border-(--primary) bg-(--primary) text-(--on-primary)"
                          : "border-(--outline) text-(--on-bg-medium) hover:border-(--on-bg-low)/40 hover:text-(--on-bg-high)",
                      )}
                    >
                      {option.label}
                      {typeof option.count === "number" && (
                        <span className="opacity-60">{option.count}</span>
                      )}
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <SheetFooter className="flex-row gap-2 border-t border-(--outline) px-6 py-4">
            {onReset && (
              <Button
                type="button"
                variant="text"
                className="flex-1"
                onClick={onReset}
                disabled={activeCount === 0}
              >
                Сбросить
              </Button>
            )}
            <SheetClose asChild>
              <Button type="button" className="flex-1">
                Показать
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </Card>
  );
}
