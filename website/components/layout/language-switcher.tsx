"use client";
import { useTransition } from "react";
import { CaretDown, Check } from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { setLocale as setLocaleServerAction } from "@/app/actions/locale";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { locale: current, setLocale } = useLanguage();
  const [pending, startTransition] = useTransition();

  const change = (next: Locale) => {
    if (next === current) return;
    setLocale(next);
    startTransition(() => setLocaleServerAction(next));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="text"
          size="small"
          disabled={pending}
          className="uppercase text-xs font-semibold tracking-wider px-2.5 gap-1"
          aria-label={`Язык: ${localeNames[current]}`}
        >
          {current}
          <CaretDown className="size-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {locales.map((l) => {
          const active = l === current;
          return (
            <DropdownMenuItem
              key={l}
              onSelect={() => change(l)}
              className={cn("gap-2 cursor-pointer", active && "font-medium")}
            >
              <span className="w-4 flex items-center">
                {active && <Check className="size-3.5 text-(--primary)" />}
              </span>
              <span>{localeNames[l]}</span>
              <span className="ml-auto text-[10px] uppercase tracking-wider text-(--on-bg-low)">
                {l}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
