import type { ReactNode } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import type { FooterSettings } from "@/components/site/Footer";
import { getSettings } from "@/lib/queries/settings";
import { safeQuery } from "@/lib/safe-query";

const FALLBACK_SETTINGS: FooterSettings = {
  brandName: "LUCCI CRENO",
  email: "luccicreno873@yahoo.com",
  phone: "7174250354",
};

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const settings = await safeQuery(
    () => getSettings() as Promise<FooterSettings>,
    FALLBACK_SETTINGS,
  );

  return <SiteShell settings={settings}>{children}</SiteShell>;
}
