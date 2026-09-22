"use client";

import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { type FormEvent, useState } from "react";

export type FooterSettings = {
  brandName?: string;
  email?: string;
  phone?: string;
  socialHandle?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    pinterest?: string;
    twitter?: string;
  };
  footerDescription?: string;
  currency?: string;
  newsletterCta?: string;
  seasonalOffer?: {
    active?: boolean;
    text?: string;
    discountPercent?: number;
    ctaLabel?: string;
    ctaHref?: string;
  };
  footerNavGroups?: Array<{
    title: string;
    links: Array<{ label: string; href: string }>;
  }>;
};

type FooterProps = {
  settings: FooterSettings;
  className?: string;
};

const POLICY_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Shipping", href: "/shipping" },
  { label: "Returns", href: "/returns" },
] as const;

const DEFAULT_GROUPS = [
  {
    title: "Explore",
    links: [
      { label: "Shop", href: "/shop" },
      { label: "Services", href: "/services" },
      { label: "Testimonials", href: "/testimonials" },
    ],
  },
  {
    title: "House",
    links: [
      { label: "About", href: "/about" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

function NewsletterForm({ cta }: { cta: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Newsletter Subscriber",
          email,
          phone: "",
          subject: "Newsletter",
          message:
            "Please add me to the LUCCI CRENO newsletter for private previews and atelier notes.",
        }),
      });

      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Unable to subscribe right now.");
      }

      setEmail("");
      setStatus("success");
      setMessage("Welcome to the circle.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Unable to subscribe right now.",
      );
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-3">
      <p className="max-w-sm text-sm leading-relaxed text-ivory/70">{cta}</p>
      <div className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="footer-newsletter-email">
          Email address
        </label>
        <input
          id="footer-newsletter-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Your email"
          autoComplete="email"
          className="min-w-0 flex-1 border border-ivory/25 bg-white/5 px-4 py-3 text-sm text-ivory placeholder:text-ivory/40 focus-visible:border-gold focus-visible:outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 bg-gold px-5 py-3 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-ink transition-colors hover:bg-gold-soft disabled:opacity-60"
        >
          {status === "loading" ? "Sending…" : "Join"}
        </button>
      </div>
      {message ? (
        <p
          className={cn(
            "text-sm",
            status === "success" ? "text-gold-soft" : "text-coral",
          )}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}

export function Footer({ settings, className }: FooterProps) {
  const brand = settings.brandName ?? "LUCCI CRENO";
  const groups = settings.footerNavGroups?.length
    ? settings.footerNavGroups
    : DEFAULT_GROUPS;
  const socials = [
    { label: "Instagram", href: settings.socialLinks?.instagram },
    { label: "Facebook", href: settings.socialLinks?.facebook },
    { label: "Pinterest", href: settings.socialLinks?.pinterest },
    { label: "Twitter", href: settings.socialLinks?.twitter },
  ].filter((item): item is { label: string; href: string } =>
    Boolean(item.href),
  );

  return (
    <footer
      className={cn(
        "relative z-10 mt-auto border-t border-ivory/15 bg-[#0e1114] text-ivory",
        className,
      )}
    >
      {settings.seasonalOffer?.active && settings.seasonalOffer.text ? (
        <div className="border-b border-ivory/10 bg-ink-soft/50">
          <div className="container-luxe flex flex-col items-start justify-between gap-3 py-4 sm:flex-row sm:items-center">
            <p className="text-sm leading-relaxed text-ivory/80">
              {settings.seasonalOffer.text}
            </p>
            {settings.seasonalOffer.ctaHref && settings.seasonalOffer.ctaLabel ? (
              <Link
                href={settings.seasonalOffer.ctaHref}
                className="shrink-0 text-[0.68rem] uppercase tracking-[0.24em] text-gold transition-colors hover:text-gold-soft"
              >
                {settings.seasonalOffer.ctaLabel}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="container-luxe py-14 md:py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-ivory"
              aria-label={`${brand} home`}
            >
              <Logo variant="monogram" className="h-10 w-10 shrink-0" />
              <span className="font-display text-xl tracking-[0.28em] sm:text-2xl">
                {brand}
              </span>
            </Link>
            {settings.footerDescription ? (
              <p className="mt-5 max-w-md text-sm leading-relaxed text-ivory/65">
                {settings.footerDescription}
              </p>
            ) : null}
            <NewsletterForm
              cta={
                settings.newsletterCta ??
                "Enter the circle — private previews and atelier notes."
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7 lg:gap-6">
            {groups.map((group) => (
              <div key={group.title}>
                <p className="mb-4 text-[0.68rem] uppercase tracking-[0.28em] text-ivory/40">
                  {group.title}
                </p>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={`${group.title}-${link.href}`}>
                      <Link
                        href={link.href}
                        className="text-sm text-ivory/75 transition-colors hover:text-ivory"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="col-span-2 sm:col-span-1">
              <p className="mb-4 text-[0.68rem] uppercase tracking-[0.28em] text-ivory/40">
                Connect
              </p>
              <ul className="space-y-3 text-sm text-ivory/75">
                {settings.email ? (
                  <li>
                    <a
                      href={`mailto:${settings.email}`}
                      className="break-all transition-colors hover:text-ivory"
                    >
                      {settings.email}
                    </a>
                  </li>
                ) : null}
                {settings.socialHandle ? (
                  <li className="text-ivory/50">@{settings.socialHandle}</li>
                ) : null}
              </ul>

              {socials.length > 0 ? (
                <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
                  {socials.map((social) => (
                    <li key={social.label}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[0.68rem] uppercase tracking-[0.2em] text-gold transition-colors hover:text-gold-soft"
                      >
                        {social.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-ivory/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ivory/40">
            © {new Date().getFullYear()} {brand}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {POLICY_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-xs text-ivory/50 transition-colors hover:text-ivory"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
