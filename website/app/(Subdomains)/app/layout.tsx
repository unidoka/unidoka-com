import type { Metadata } from "next";
import { CheckUser } from "@/entities/user/model/check-user";
import ProfileRootClientLayout from "./client-layout";
export const metadata: Metadata = {
  title: "Профиль",
  description: "Личный кабинет Unidoka - события, настройки, безопасность.",
  robots: { index: false, follow: false },
};
export default function AppRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <CheckUser>
      <ProfileRootClientLayout>{children}</ProfileRootClientLayout>
    </CheckUser>
  );
}
