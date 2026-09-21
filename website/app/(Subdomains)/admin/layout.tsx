import type { Metadata } from "next";
import { CheckUser } from "@/entities/user/model/check-user";
import AdminRootClientLayout from "./client-layout";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin panel",
};

export default async function AdminRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ secret?: string }>;
}) {
  const { secret } = await params;
  return (
    <CheckUser>
      <AdminRootClientLayout secret={secret ?? ""}>
        {children}
      </AdminRootClientLayout>
    </CheckUser>
  );
}
