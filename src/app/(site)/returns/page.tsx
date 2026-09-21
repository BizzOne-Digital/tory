import type { Metadata } from "next";
import {
  generatePolicyMetadata,
  PolicyPage,
} from "@/app/(site)/_policy/PolicyPage";

export async function generateMetadata(): Promise<Metadata> {
  return generatePolicyMetadata("returns", "Returns & Exchanges");
}

export default function ReturnsPage() {
  return <PolicyPage slug="returns" fallbackTitle="Returns & Exchanges" />;
}
