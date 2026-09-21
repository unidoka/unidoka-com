"use client"
import { AdminSidebar } from "./_components/admin-sidebar";
import { Container } from "@/components/ui/container";
import { CheckUser } from "@/entities/user/model/check-user";

export default function AdminRootClientLayout({
  children,
  secret,
}: {
  children: React.ReactNode;
  secret: string;
}) {
  return (
    <div className="min-h-screen py-6 md:py-8">
      <Container variant="full-width">
        <div className="flex flex-col md:flex-row gap-6">
          <AdminSidebar secret={secret} />
          <main className="w-full">
            {children}
          </main>
        </div>
      </Container>
    </div>
  );
}
