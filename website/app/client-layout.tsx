"use client"
import "./globals.css";
import BottomAppBar from "@/components/layout/nav/bottom-app-bar";
import Footer from "@/components/layout/nav/footer";
import Header from "@/components/layout/nav/header";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";

export default function ClientRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { lang } = useLanguage();
  return (
    <>
      <Header />
      <div className="relative -mt-[60px]" key={lang}>
        <main
          className={cn(
            "mb-0 mt-0 overflow-x-clip pb-24 sm:pb-0",
          )}
        >
          {children}
        </main>
        <Footer />
        <BottomAppBar />
        <Toaster
          position="bottom-right"
          closeButton
          gap={8}
          visibleToasts={3}
        />
      </div>
    </>
  );
}
