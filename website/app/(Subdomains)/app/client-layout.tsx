"use client"
import { ProfileSidebar } from "./_components/profile-sidebar";
import { Container } from "@/components/ui/container";

export default function ProfileRootClientLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-(--bg) py-12 md:py-16">
      <Container>
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 [&:has([data-collapsed=true])]:gap-2 lg:[&:has([data-collapsed=true])]:gap-4 [&>[data-collapsed=true]]:gap-4 lg:[&>[data-collapsed=true]]:gap-6">
          <aside className="w-full md:w-64 shrink-0">
            <ProfileSidebar />
          </aside>
          <main className="flex-1 flex justify-center">
            <div className="w-full max-w-5xl space-y-8">
              {children}
            </div>
          </main>
        </div>
      </Container>
    </div>
  )
}
