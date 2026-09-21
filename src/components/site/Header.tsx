"use client";

import { Logo } from "@/components/brand/Logo";
import { useCartStore } from "@/lib/cart/store";
import { cn } from "@/lib/utils";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Shop", href: "/shop" },
  { label: "Services", href: "/services" },
  { label: "Gallery", href: "/gallery" },
  { label: "Journal", href: "/blog" },
  { label: "Contact", href: "/contact" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const itemCount = useCartStore((state) => state.itemCount());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[250] focus:bg-ink focus:px-4 focus:py-2 focus:text-ivory"
      >
        Skip to content
      </a>

      <header
        className={cn(
          "sticky top-0 z-[100] border-b transition-[background,backdrop-filter,box-shadow] duration-500",
          scrolled
            ? "border-border/80 bg-surface/90 shadow-[0_12px_40px_rgba(20,24,28,0.06)] backdrop-blur-xl"
            : "border-transparent bg-surface/55 backdrop-blur-md",
        )}
      >
        <div className="container-luxe flex h-[var(--header-h)] items-center justify-between gap-3 sm:gap-6">
          <Link
            href="/"
            className="relative z-[110] shrink-0 text-ink transition-opacity hover:opacity-80"
            aria-label="LUCCI CRENO home"
          >
            <Logo
              variant="wordmark"
              className="hidden h-7 w-auto sm:block md:h-8"
            />
            <Logo variant="monogram" className="h-9 w-9 sm:hidden" />
          </Link>

          <nav
            className="hidden items-center gap-7 lg:flex"
            aria-label="Primary"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "link-underline text-[0.72rem] uppercase tracking-[0.22em] transition-colors",
                  isActive(pathname, link.href)
                    ? "text-ink"
                    : "text-muted hover:text-ink",
                )}
                aria-current={isActive(pathname, link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="relative z-[110] flex items-center gap-3 sm:gap-4">
            <Link
              href="/shop"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5"
              aria-label="Search shop"
            >
              <Search className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.5} />
            </Link>

            <Link
              href="/cart"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5"
              aria-label={`Shopping bag${itemCount > 0 ? `, ${itemCount} items` : ""}`}
            >
              <ShoppingBag className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[0.58rem] font-medium text-ink">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5 lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? (
                <X className="h-5 w-5" strokeWidth={1.5} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-nav"
        className={cn(
          "fixed inset-0 z-[90] bg-ink/35 transition-opacity duration-500 lg:hidden",
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!menuOpen}
        onClick={() => setMenuOpen(false)}
      />

      <nav
        id="mobile-nav-panel"
        className={cn(
          "fixed inset-y-0 right-0 z-[95] flex w-full max-w-sm flex-col bg-cream px-8 pb-10 pt-28 shadow-2xl transition-transform duration-500 ease-[var(--ease-luxe)] lg:hidden",
          menuOpen ? "translate-x-0" : "translate-x-full",
        )}
        aria-label="Mobile"
        aria-hidden={!menuOpen}
      >
        <ul className="flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "block border-b border-border/70 py-4 font-display text-2xl tracking-[0.08em] transition-colors",
                  isActive(pathname, link.href)
                    ? "text-ink"
                    : "text-muted hover:text-ink",
                )}
                aria-current={isActive(pathname, link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-auto space-y-3 pt-10">
          <p className="eyebrow">Atelier</p>
          <p className="text-sm leading-relaxed text-muted">
            Genuine luxury, tailored for the way you live.
          </p>
        </div>
      </nav>
    </>
  );
}
