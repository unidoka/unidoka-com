"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CheckUser } from "@/entities/user/model/check-user";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EventTypesEditor } from "./_components/event-types-editor";
import { DirectionsEditor } from "./_components/directions-editor";
import { OrganizersList } from "../companies/_components/organizers-list";
import { AdminPageHeader } from "../../_components/admin-page-header";

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
        <AdminPageHeader
          title="Каталоги"
          meta="Справочники событий: типы, направления и организаторы"
        />
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="max-w-full justify-start overflow-x-auto">
            <TabsTrigger value="types" className="flex-none px-3">
              Типы
            </TabsTrigger>
            <TabsTrigger value="directions" className="flex-none px-3">
              Направления
            </TabsTrigger>
            <TabsTrigger value="organizers" className="flex-none px-3">
              Организаторы
            </TabsTrigger>
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
