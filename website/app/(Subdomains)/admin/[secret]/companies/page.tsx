"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CheckUser } from "@/entities/user/model/check-user";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CompaniesList } from "./_components/companies-list";
import { OrganizersList } from "./_components/organizers-list";

/**
 * Companies + Organizers hub.
 *
 * The two admin areas were separate top-level routes. They both deal
 * with "external entities the org works with", so they now live behind
 * a single sidebar entry (/companies) and split by tab. Tab state is
 * in `?tab=` — a `router.replace(..., { scroll: false })` swaps it
 * without a navigation.
 */
function CompaniesInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab =
    searchParams.get("tab") === "organizers" ? "organizers" : "companies";

  const setTab = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <CheckUser permission="admin.orders">
      <div className="space-y-6">
        <div>
          <h1 className="text-display-2 mb-1">Компании</h1>
          <p className="text-body-3 text-(--on-bg-medium)">
            Клиенты и организаторы событий
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="companies">Компании</TabsTrigger>
            <TabsTrigger value="organizers">Организаторы</TabsTrigger>
          </TabsList>

          <TabsContent value="companies" className="mt-4">
            <CompaniesList />
          </TabsContent>
          <TabsContent value="organizers" className="mt-4">
            <OrganizersList />
          </TabsContent>
        </Tabs>
      </div>
    </CheckUser>
  );
}

export default function AdminCompaniesPage() {
  return (
    <Suspense fallback={null}>
      <CompaniesInner />
    </Suspense>
  );
}
