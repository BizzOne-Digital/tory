import type { Metadata } from "next";
import {
  generatePolicyMetadata,
  PolicyPage,
} from "@/app/(site)/_policy/PolicyPage";

export async function generateMetadata(): Promise<Metadata> {
  return generatePolicyMetadata("terms", "Terms of Service");
}

export default function TermsPage() {
  return <PolicyPage slug="terms" fallbackTitle="Terms of Service" />;
}
