import type { ReactNode } from "react";
import { getSession } from "@/lib/auth/session";
import { AdminLayoutWrapper } from "@/components/admin/AdminLayoutWrapper";
import { ToastProvider } from "@/components/admin/Toast";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  return (
    <ToastProvider>
      <AdminLayoutWrapper session={session}>{children}</AdminLayoutWrapper>
    </ToastProvider>
  );
}
