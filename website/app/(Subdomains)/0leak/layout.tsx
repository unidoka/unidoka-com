import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "0leak — мониторинг утечек",
  description: "Система обнаружения утечек на промышленных объектах",
};

export default function ZeroLeakLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
