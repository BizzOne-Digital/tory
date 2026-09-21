"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import type { SessionPayload } from "@/lib/auth/session";
import { AdminShell } from "./AdminShell";

type AdminLayoutWrapperProps = {
  session: SessionPayload | null;
  children: ReactNode;
};

export function AdminLayoutWrapper({
  session,
  children,
}: AdminLayoutWrapperProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (!isLogin && !session) {
      const next = encodeURIComponent(pathname);
      router.replace(`/admin/login?next=${next}`);
    }
  }, [isLogin, session, pathname, router]);

  if (isLogin) {
    return (
      <div className="admin-shell min-h-screen bg-[#f4f1ec] text-ink">
        {children}
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <AdminShell session={session}>{children}</AdminShell>;
}
