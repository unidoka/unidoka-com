"use client"

import "./globals.css";
import Header from "@/components/layout/nav/header";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function ClientRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <>
      <Header />
      <main className={cn(pathname == '/' ? "mt-0" : "mt-0", "mb-0")}>
        {children}
      </main>
      <Toaster
        position="bottom-right"
        closeButton
        gap={8}
        visibleToasts={3}
      />
    </>
  );
}
