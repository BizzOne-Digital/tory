import type { Metadata } from "next";
import { PolicyPageContent } from "@/components/policy/PolicyPageContent";
import { getPageBySlug } from "@/lib/queries/pages";
import { safeQuery } from "@/lib/safe-query";
import type { PageData } from "@/types/cms";

type Props = { slug: string; fallbackTitle: string };

async function loadPolicy(slug: string) {
  return safeQuery(() => getPageBySlug(slug) as Promise<PageData | null>, null);
}

export async function generatePolicyMetadata(
  slug: string,
  fallbackTitle: string,
): Promise<Metadata> {
  const page = await loadPolicy(slug);
  return {
    title: page?.seo?.title ?? fallbackTitle,
    description: page?.seo?.description ?? page?.hero?.subtitle,
  };
}

export async function PolicyPage({ slug }: Props) {
  const page = await loadPolicy(slug);
  return <PolicyPageContent page={page} />;
}
