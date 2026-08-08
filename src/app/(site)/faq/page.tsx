import type { Metadata } from "next";
import { PageHeroBlock } from "@/components/content/PageHero";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { getPageBySlug } from "@/lib/queries/pages";
import { getFaqs } from "@/lib/queries/catalog";
import { safeQuery } from "@/lib/safe-query";
import type { FaqCategoryData, FaqData, PageData } from "@/types/cms";

export async function generateMetadata(): Promise<Metadata> {
  const page = await safeQuery(
    () => getPageBySlug("faqs") as Promise<PageData | null>,
    null,
  );
  return {
    title: page?.seo?.title ?? "FAQs",
    description: page?.seo?.description ?? page?.hero?.subtitle,
  };
}

export default async function FaqPage() {
  const [page, faqData] = await Promise.all([
    safeQuery(() => getPageBySlug("faqs") as Promise<PageData | null>, null),
    safeQuery(
      () =>
        getFaqs() as Promise<{
          categories: FaqCategoryData[];
          faqs: FaqData[];
        }>,
      { categories: [], faqs: [] },
    ),
  ]);

  return (
    <>
      <PageHeroBlock hero={page?.hero} fallbackTitle="Frequently Asked Questions" size="compact" />
      <div className="container-wide section-pad max-w-4xl">
        <FaqAccordion categories={faqData.categories} faqs={faqData.faqs} />
      </div>
    </>
  );
}
