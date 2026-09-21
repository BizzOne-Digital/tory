import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getSettings } from "@/lib/queries/settings";
import { safeQuery } from "@/lib/safe-query";
import type { SettingsData } from "@/types/cms";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your LUCCI CRENO order.",
};

export default async function CheckoutPage() {
  const settings = await safeQuery(
    () => getSettings() as Promise<SettingsData>,
    { currency: "USD" },
  );

  return (
    <div className="container-wide section-pad">
      <p className="eyebrow text-gold">Checkout</p>
      <h1 className="mt-3 font-display text-4xl text-ink">Complete your order</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Submit your details below. Payment is pending — our atelier will contact you with
        secure payment instructions. Please do not enter card numbers on this page.
      </p>
      <div className="mt-10">
        <CheckoutForm currency={settings.currency ?? "USD"} />
      </div>
    </div>
  );
}
