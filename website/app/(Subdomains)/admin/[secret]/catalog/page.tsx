"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CheckUser } from "@/entities/user/model/check-user";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EventTypesEditor } from "./_components/event-types-editor";
import { DirectionsEditor } from "./_components/directions-editor";
import { OrganizersList } from "../companies/_components/organizers-list";

function CatalogInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const raw = searchParams.get("tab");
  const tab =
    raw === "directions" || raw === "organizers" ? raw : "types";

  const setTab = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <CheckUser permission="admin.catalog">
      <div className="space-y-6">
        <div>
          <h1 className="text-display-2 mb-1">Каталоги</h1>
          <p className="text-body-3 text-(--on-bg-medium)">
            Справочники событий: типы, направления и организаторы
          </p>
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="types">Типы</TabsTrigger>
            <TabsTrigger value="directions">Направления</TabsTrigger>
            <TabsTrigger value="organizers">Организаторы</TabsTrigger>
          </TabsList>
          <TabsContent value="types" className="mt-4">
            <EventTypesEditor />
          </TabsContent>
          <TabsContent value="directions" className="mt-4">
            <DirectionsEditor />
          </TabsContent>
          <TabsContent value="organizers" className="mt-4">
            <OrganizersList />
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
