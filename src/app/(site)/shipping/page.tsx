import type { Metadata } from "next";
import {
  generatePolicyMetadata,
  PolicyPage,
} from "@/app/(site)/_policy/PolicyPage";

export async function generateMetadata(): Promise<Metadata> {
  return generatePolicyMetadata("shipping", "Shipping");
}

export default function ShippingPage() {
  return <PolicyPage slug="shipping" fallbackTitle="Shipping" />;
}
