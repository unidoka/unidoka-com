import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Amorfa — AI-optimized fullstack framework",
  description:
    "Amorfa — open-source fullstack framework for building apps in hours. FastAPI + Next.js + PostgreSQL, ready to ship, AI-friendly.",
};

export default function AmorfaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
