import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Решения",
  description:
    "То, что создаёт будущее - open source решения, новые способы организации , бизнес-сообщества и многое другое",
  alternates: { canonical: "/solutions" },
};

export default function SolutionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
