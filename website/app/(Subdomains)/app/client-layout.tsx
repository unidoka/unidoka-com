"use client";

import { ProfileSidebar } from "./_components/profile-sidebar";
import { Container } from "@/components/ui/container";

export default function ProfileRootClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-(--bg) py-16 md:py-24">
      <Container variant="full-width">
        <div className="flex flex-col md:flex-row gap-10 lg:gap-16 items-start">
          <aside className="w-full md:w-auto md:sticky md:top-28 md:self-start shrink-0">
            <ProfileSidebar />
          </aside>
          <div role="main" className="flex-1 min-w-0 pb-24">
            <div className="w-full max-w-4xl space-y-8 min-w-0">{children}</div>
          </div>
        </div>
      </Container>
    </div>
  );
}
