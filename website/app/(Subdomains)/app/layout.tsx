import type { Metadata } from "next";
import { CheckUser } from "@/entities/user/model/check-user";
import ProfileRootClientLayout from "./client-layout";
export const metadata: Metadata = {
  title: "Профиль · Rovno.dev",
  description: "Личный кабинет",
};
export default function AppRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <CheckUser>
      <ProfileRootClientLayout>{children}</ProfileRootClientLayout>
    </CheckUser>
  );
}
