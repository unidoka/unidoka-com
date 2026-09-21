"use client";
import { useEffect, useState } from "react";
import { Cookie } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  if (!visible) return null;

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 z-[70] mx-auto flex max-w-3xl flex-col items-start gap-3 rounded-2xl border border-(--outline) bg-(--card) p-4 shadow-lg sm:flex-row sm:items-center">
      <Cookie className="hidden size-5 shrink-0 text-(--primary) sm:block" />
      <p className="flex-1 text-body-4 text-(--on-bg-medium)">
        Мы используем cookie для аналитики и улучшения сайта.
      </p>
      <Button size="small" shape="round" onClick={accept}>
        Принять
      </Button>
    </div>
  );
}
