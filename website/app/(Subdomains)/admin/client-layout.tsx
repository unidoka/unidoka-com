"use client"
import { AdminSidebar } from "./_components/admin-sidebar";
import { Container } from "@/components/ui/container";
export default function AdminRootClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen py-6 md:py-8">
      <Container variant="full-width">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:w-auto md:sticky md:top-24 md:self-start shrink-0">
            <AdminSidebar />
          </div>
          <div role="main" className="w-full min-w-0 pb-24">
            {children}
          </div>
        </div>
      </Container>
    </div>
  );
}
