"use client";
import "./globals.css";
import Header from "@/components/layout/nav/header";
import Footer from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ClientRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const hideChrome =
    pathname?.startsWith("/admin") || pathname?.startsWith("/app");

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <Header />
      <main className={cn("flex-1", "mb-0")}>{children}</main>
      {!hideChrome && <Footer />}
      <Toaster position="bottom-right" closeButton gap={8} visibleToasts={3} />
    </div>
  );
}
