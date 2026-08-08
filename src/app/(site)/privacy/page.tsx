import type { Metadata } from "next";
import {
  generatePolicyMetadata,
  PolicyPage,
} from "@/app/(site)/_policy/PolicyPage";

export async function generateMetadata(): Promise<Metadata> {
  return generatePolicyMetadata("privacy", "Privacy Policy");
}

export default function PrivacyPage() {
  return <PolicyPage slug="privacy" fallbackTitle="Privacy Policy" />;
}
