"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CheckUser } from "@/entities/user/model/check-user";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UtmBuilder } from "./_components/utm-builder";
import { SocialPreview } from "./_components/social-preview";
import { SlugGenerator } from "./_components/slug-generator";

/**
 * Marketing tools.
 *
 * Three client-only utilities. No backend, no persistence — they run
 * entirely in the browser. Tab state lives in `?tab=` so a bookmark
 * reopens the same tool, and switching tabs doesn't push a history
 * entry (router.replace + scroll: false).
 */
function ToolsInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const raw = searchParams.get("tab");
  const tab =
    raw === "preview" || raw === "slug" ? raw : "utm";

  const setTab = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <CheckUser>
      <div className="space-y-6">
        <div>
          <h1 className="text-display-2 mb-1">Инструменты</h1>
          <p className="text-body-3 text-(--on-bg-medium)">
            Рабочие утилиты для ссылок, превью и URL-слагов
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="utm">UTM</TabsTrigger>
            <TabsTrigger value="preview">Превью</TabsTrigger>
            <TabsTrigger value="slug">Slug</TabsTrigger>
          </TabsList>

          <TabsContent value="utm" className="mt-4">
            <UtmBuilder />
          </TabsContent>
          <TabsContent value="preview" className="mt-4">
            <SocialPreview />
          </TabsContent>
          <TabsContent value="slug" className="mt-4">
            <SlugGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </CheckUser>
  );
}

export default function ToolsPage() {
  return (
    <Suspense fallback={null}>
      <ToolsInner />
    </Suspense>
  );
}
