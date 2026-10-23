import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Решения",
  description:
    "Студия полного цикла, open-source фреймворк Amorfa и календарь IT-событий - продукты и сервисы Unidoka.",
  alternates: { canonical: "/solutions" },
};

export default function SolutionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
