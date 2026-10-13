"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CheckUser } from "@/entities/user/model/check-user";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EventTypesEditor } from "./_components/event-types-editor";
import { DirectionsEditor } from "./_components/directions-editor";

/**
 * Catalog hub.
 *
 * Event Types and Directions were two sibling pages reached from the
 * sidebar. They're conceptually one thing (event taxonomies) so they
 * now share a page and switch via tabs. Tab state lives in a `?tab=`
 * query param rather than component state: `router.replace(..., {
 * scroll: false })` swaps it without a navigation, which keeps the
 * back button out of the picture and leaves the URL bookmarkable.
 */
function CatalogInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") === "directions" ? "directions" : "types";

  const setTab = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <CheckUser>
      <div className="space-y-6">
        <div>
          <h1 className="text-display-2 mb-1">Каталоги</h1>
          <p className="text-body-3 text-(--on-bg-medium)">
            Справочники типов событий и направлений
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="types">Типы событий</TabsTrigger>
            <TabsTrigger value="directions">Направления</TabsTrigger>
          </TabsList>

          <TabsContent value="types" className="mt-4">
            <EventTypesEditor />
          </TabsContent>
          <TabsContent value="directions" className="mt-4">
            <DirectionsEditor />
          </TabsContent>
        </Tabs>
      </div>
    </CheckUser>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={null}>
      <CatalogInner />
    </Suspense>
  );
}
