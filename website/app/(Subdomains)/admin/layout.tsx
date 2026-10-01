import type { Metadata } from "next";
import { CheckUser } from "@/entities/user/model/check-user";
import AdminRootClientLayout from "./client-layout";
export const metadata: Metadata = {
  title: "Admin · Rovno.dev",
  description: "Admin panel",
};
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <CheckUser>
      <AdminRootClientLayout>{children}</AdminRootClientLayout>
    </CheckUser>
  );
}
