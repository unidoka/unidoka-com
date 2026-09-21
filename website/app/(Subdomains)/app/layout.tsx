import type { Metadata } from "next";
import { CheckUser } from "@/entities/user/model/check-user";
import ProfileRootClientLayout from "./client-layout";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin panel",
};
export default function AdminRootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <CheckUser>
      <ProfileRootClientLayout>
        {children}
      </ProfileRootClientLayout>
    </CheckUser>
  )
}
