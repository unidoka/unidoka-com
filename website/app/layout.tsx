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
import { CookieConsent } from "@/components/layout/marketing/cookie-consent";
import UserProvider from "@/entities/user/model/user-context";
import ClientRootLayout from "./client-layout";

export const Geist = localFont({
  src: '../public/fonts/Geist-VariableFont_wght.woff2',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: "Цифровое агентство полного цикла Rovno.dev",
  description: "Digital-агентство полного цикла Rovno.dev - дизайн, LLM, сайты, приложения, логотипы и айдентика, 3D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(Geist.className, "font-sans")}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'system';
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (theme === 'system' && supportDarkMode)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <UserProvider>
              <TooltipProvider>
                <ClientRootLayout>
                  {children}
                </ClientRootLayout>
                <CookieConsent />
              </TooltipProvider>
            </UserProvider>
          </LanguageProvider>
        </ThemeProvider>
        <YandexMetrika />
      </body>
    </html>
  );
}
