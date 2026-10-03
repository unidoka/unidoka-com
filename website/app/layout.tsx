import "./globals.css";
import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import localFont from "next/font/local";
import { ThemeProvider } from "@/providers/theme-provider";
import { LanguageProvider } from "@/providers/language-provider";
import UserProvider from "@/entities/user/model/user-context";
import ClientRootLayout from "./client-layout";
import { CookieConsent } from "@/components/layout/marketing/cookie-consent";
import { YandexMetrika } from "@/components/layout/marketing/yandex-metrika";

export const Geist = localFont({
  src: "../public/fonts/Geist-VariableFont_wght.woff2",
  variable: "--font-sans",
});

const SITE_URL = process.env.NEXT_PUBLIC_ROOT_DOMAIN
  ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "unidoka.com - IT-события для своих",
    template: `%s | unidoka.com`,
  },
  description:
    "unidoka.com - закрытое IT-сообщество. События, статьи, нетворкинг и проекты для разработчиков, дизайнеров и продактов.",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: SITE_URL,
    siteName: "unidoka.com",
    title: "unidoka.com - IT-события для своих",
    description:
      "Закрытое IT-сообщество. События, статьи, нетворкинг и проекты.",
    images: [`${SITE_URL}/og.jpg`],
  },
  twitter: {
    card: "summary_large_image",
    title: "unidoka.com - IT-события для своих",
    description: "Закрытое IT-сообщество. События, статьи, нетворкинг.",
    images: [`${SITE_URL}/og.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    // SVG pair — the browser picks one based on the user's OS theme.
    // Both files live in /public so Next.js serves them verbatim.
    icon: [
      { url: "/icon-light.svg", type: "image/svg+xml", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark.svg",  type: "image/svg+xml", media: "(prefers-color-scheme: dark)"  },
      // Legacy fallback for browsers that don't support SVG favicons
      // (old Safari <16, old Edge). Kept as .ico so those still get a mark.
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    // iOS home-screen icon — PNG only, iOS does not render SVG here.
    // Drop a 180×180 PNG at website/app/apple-icon.png and Next.js
    // auto-detects it; this line is only here so you know where to look.
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
try {
  const theme = localStorage.getItem("theme") || "system";
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  if (isDark) document.documentElement.classList.add("dark");
} catch (e) {}
`,
          }}
        />
      </head>
      <body className={`${Geist.variable} font-sans antialiased`}>
        <ThemeProvider>
          <LanguageProvider>
            <UserProvider>
              <TooltipProvider>
                <ClientRootLayout>{children}</ClientRootLayout>
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
