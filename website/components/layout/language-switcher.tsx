"use client";

import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/language-provider";
import { CaretDown, Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelect = (newLang: "en" | "ru") => {
    setLang(newLang);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "group flex items-center gap-1.5 rounded-full border border-(--outline) bg-(--card) px-3 h-9 text-sm font-medium transition-all duration-200",
            "hover:border-(--primary)/50 hover:shadow-sm cursor-pointer",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          )}
          aria-label={lang === "en" ? "Change language" : "Изменить язык"}
        >
          <span className="uppercase font-semibold tracking-wide">{mounted && lang}</span>
          <CaretDown className="size-3 text-(--on-bg-low) transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 p-1.5">
        <DropdownMenuItem
          onClick={() => handleSelect("en")}
          className={cn(
            "flex items-center justify-between rounded-lg px-2 py-2 cursor-pointer transition-colors",
            lang === "en" && "bg-(--primary-card) text-(--primary)"
          )}
        >
          <span className="flex items-center gap-2.5">
            <span className="text-lg leading-none">🇬🇧</span>
            <span className="text-sm font-medium">English</span>
          </span>
          {lang === "en" && <Check className="size-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSelect("ru")}
          className={cn(
            "flex items-center justify-between rounded-lg px-2 py-2 cursor-pointer transition-colors",
            lang === "ru" && "bg-(--primary-card) text-(--primary)"
          )}
        >
          <span className="flex items-center gap-2.5">
            <span className="text-lg leading-none">🇷🇺</span>
            <span className="text-sm font-medium">Русский</span>
          </span>
          {lang === "ru" && <Check className="size-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
