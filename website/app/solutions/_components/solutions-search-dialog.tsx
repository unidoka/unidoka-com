"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Solution } from "@/utils/api/solutions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  solutions: Solution[];
}

function scoreSolution(solution: Solution, query: string): number {
  if (!query) return 1;
  const title = solution.title.toLowerCase();
  if (title === query) return 100;
  if (title.startsWith(query)) return 70;
  if (title.includes(query)) return 50;

  const haystack = [
    solution.short_description,
    solution.category,
    solution.period,
    ...(solution.tags ?? []).map((tag) => tag.title),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query) ? 25 : 0;
}

export function SolutionsSearchDialog({ open, onOpenChange, solutions }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.code !== "KeyK") return;
      event.preventDefault();
      if (!event.repeat) {
        if (!open) setQuery("");
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange, open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return solutions
      .map((solution) => ({ solution, score: scoreSolution(solution, q) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [query, solutions]);

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    setQuery("");
  };

  const select = (solution: Solution) => {
    handleOpenChange(false);
    router.push(`/solutions/${solution.slug}`);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[560px] md:max-w-[720px]">
        <DialogHeader className="border-b border-(--outline) px-6 pt-6 pb-4">
          <DialogTitle className="text-display-4 leading-[1.05]">
            Поиск решений
          </DialogTitle>
        </DialogHeader>
        <Command className="bg-transparent p-2" shouldFilter={false}>
          <CommandInput
            autoFocus
            value={query}
            onValueChange={setQuery}
            placeholder="Название, тег, категория…"
          />
          <CommandList className="max-h-[420px]">
            <CommandEmpty>Ничего не найдено</CommandEmpty>
            <CommandGroup>
              {results.map(({ solution }) => {
                const meta = [
                  solution.category,
                  solution.period,
                  solution.short_description,
                ]
                  .filter(Boolean)
                  .join(" · ");

                return (
                  <CommandItem
                    key={solution.id}
                    value={`${solution.title} ${solution.id}`}
                    onSelect={() => select(solution)}
                    className="cursor-pointer items-start gap-3 rounded-lg px-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-body-4 text-(--on-bg-high)">
                        {solution.title}
                      </p>
                      {meta && (
                        <p className="mt-0.5 truncate text-body-5 text-(--on-bg-low)">
                          {meta}
                        </p>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
