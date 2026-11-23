"use client";

import { AdminSidebar } from "./_components/admin-sidebar";
import { Container } from "@/components/ui/container";

export default function AdminRootClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-(--bg) text-(--on-bg-high) pt-24 sm:pt-28 md:pt-32 pb-20">
      <Container >
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
          <div className="w-full md:w-auto md:sticky md:top-32 md:self-start shrink-0">
            <AdminSidebar />
          </div>
          <div role="main" className="w-full min-w-0 pb-16">
            {children}
          </div>
        </div>
      </Container>
    </div>
  );
}
