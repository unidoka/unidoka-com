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
import type { Article } from "@/utils/api/articles";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articles: Article[];
}

function scoreArticle(article: Article, query: string): number {
  if (!query) return 1;
  const title = article.title.toLowerCase();
  if (title === query) return 100;
  if (title.startsWith(query)) return 70;
  if (title.includes(query)) return 50;

  const haystack = [
    article.description,
    article.category,
    article.author_name,
    ...(article.tags ?? []).map((tag) => tag.title),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query) ? 25 : 0;
}

export function ArticlesSearchDialog({ open, onOpenChange, articles }: Props) {
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
    return articles
      .map((article) => ({ article, score: scoreArticle(article, q) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [query, articles]);

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    setQuery("");
  };

  const select = (article: Article) => {
    handleOpenChange(false);
    router.push(`/blog/${article.slug}`);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[560px] md:max-w-[720px]">
        <DialogHeader className="border-b border-(--outline) px-6 pt-6 pb-4">
          <DialogTitle className="text-display-4 leading-[1.05]">
            Поиск статей
          </DialogTitle>
        </DialogHeader>
        <Command className="bg-transparent p-2" shouldFilter={false}>
          <CommandInput
            autoFocus
            value={query}
            onValueChange={setQuery}
            placeholder="Название, тег, автор…"
          />
          <CommandList className="max-h-[420px]">
            <CommandEmpty>Ничего не найдено</CommandEmpty>
            <CommandGroup>
              {results.map(({ article }) => {
                const meta = [article.category, article.author_name, article.description]
                  .filter(Boolean)
                  .join(" · ");

                return (
                  <CommandItem
                    key={article.id}
                    value={`${article.title} ${article.id}`}
                    onSelect={() => select(article)}
                    className="cursor-pointer items-start gap-3 rounded-lg px-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-body-4 text-(--on-bg-high)">
                        {article.title}
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
