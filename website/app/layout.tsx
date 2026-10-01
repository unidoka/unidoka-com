import "./globals.css";
import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils";
import localFont from 'next/font/local'
import { ThemeProvider } from "@/providers/theme-provider";
import { LanguageProvider } from "@/providers/language-provider";
import BottomAppBar from "@/components/layout/nav/bottom-app-bar";
import Header from "@/components/layout/nav/header";
import { Toaster } from "@/components/ui/sonner";
import { YandexMetrika } from "@/components/layout/marketing/yandex-metrika";

export const Geist = localFont({
  src: '../public/fonts/Geist-VariableFont_wght.woff2',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: "Unidoka — Digital Agency",
  description: "We design and build reliable, high-load digital products for complex problems.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={cn(Geist.variable, "font-sans bg-(--bg) text-(--on-bg-high)")}>
        <ThemeProvider>
          <LanguageProvider>
            <TooltipProvider>
              <Header />
              {children}
              <BottomAppBar />
              <Toaster />
              <YandexMetrika />
            </TooltipProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
