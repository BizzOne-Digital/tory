import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import { getSettings } from "@/lib/queries/settings";
import { safeQuery } from "@/lib/safe-query";
import type { SettingsData } from "@/types/cms";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your LUCCI CRENO selections.",
};

export default async function CartPage() {
  const settings = await safeQuery(
    () => getSettings() as Promise<SettingsData>,
    { currency: "USD" },
  );

  return (
    <div className="container-wide section-pad">
      <p className="eyebrow text-gold">Your selections</p>
      <h1 className="mt-3 font-display text-4xl text-ink">Shopping bag</h1>
      <div className="mt-10">
        <CartView currency={settings.currency ?? "USD"} />
      </div>
    </div>
  );
}
