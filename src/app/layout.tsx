import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { MotionProviders } from "@/components/motion/providers";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "LUCCI CRENO — Genuine Luxury You Wear",
    template: "%s · LUCCI CRENO",
  },
  description:
    "Bespoke tailoring, couture edits, and timeless wardrobe pieces from the LUCCI CRENO atelier.",
  openGraph: {
    siteName: "LUCCI CRENO",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full`}>
      <body className="flex min-h-full max-w-[100vw] flex-col overflow-x-hidden antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[300] focus:bg-ink focus:px-4 focus:py-2 focus:text-ivory"
        >
          Skip to main content
        </a>
        <MotionProviders>{children}</MotionProviders>
      </body>
    </html>
  );
}
