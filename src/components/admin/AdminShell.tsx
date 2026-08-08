"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  BookOpen,
  HelpCircle,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import type { SessionPayload } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

const NAV: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/pages", label: "Pages", icon: BookOpen },
  { href: "/admin/products", label: "Products / Pricing", icon: ShoppingBag },
  { href: "/admin/services", label: "Services", icon: Sparkles },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/testimonials", label: "Testimonials", icon: Star },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/admin/blog", label: "Blog", icon: BookOpen },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/messages", label: "Contact Messages", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

type AdminShellProps = {
  session: SessionPayload;
  children: ReactNode;
};

export function AdminShell({ session, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-5 py-5">
        <Link href="/admin" className="flex items-center gap-3 text-ink">
          <Logo variant="monogram" className="h-10 w-10 text-gold" />
          <div>
            <p className="font-display text-sm tracking-[0.18em]">LUCCI CRENO</p>
            <p className="text-[0.65rem] uppercase tracking-[0.16em] text-muted">
              Admin
            </p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-ink text-ivory"
                      : "text-ink-soft hover:bg-white hover:text-ink",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-border p-4">
        <p className="truncate text-xs text-muted">{session.email}</p>
        <button
          type="button"
          onClick={() => void logout()}
          disabled={loggingOut}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-sm border border-border bg-white px-3 py-2 text-xs uppercase tracking-[0.12em] text-ink hover:bg-stone-50 disabled:opacity-60"
        >
          <LogOut className="h-3.5 w-3.5" />
          {loggingOut ? "Signing out…" : "Log out"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="admin-shell min-h-screen bg-[#f4f1ec] text-ink">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-border bg-[#faf8f5] lg:block">
          {sidebar}
        </aside>

        {open ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-ink/40"
              onClick={() => setOpen(false)}
            />
            <aside className="relative h-full w-72 max-w-[85vw] border-r border-border bg-[#faf8f5] shadow-xl">
              <button
                type="button"
                aria-label="Close sidebar"
                className="absolute right-3 top-3 rounded-sm p-2 text-ink hover:bg-white"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
              {sidebar}
            </aside>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-[#f4f1ec]/95 px-4 py-3 backdrop-blur lg:hidden">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className="rounded-sm p-2 hover:bg-white"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Logo variant="monogram" className="h-8 w-8 text-gold" />
            <span className="font-display text-sm tracking-[0.14em]">Admin</span>
          </header>
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
