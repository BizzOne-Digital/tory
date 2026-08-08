import type { Metadata } from "next";
import { PageHeroBlock } from "@/components/content/PageHero";
import { TestimonialCarousel } from "@/components/testimonials/TestimonialCarousel";
import { getPageBySlug } from "@/lib/queries/pages";
import { getTestimonials } from "@/lib/queries/catalog";
import { safeQuery } from "@/lib/safe-query";
import type { PageData, TestimonialData } from "@/types/cms";

export async function generateMetadata(): Promise<Metadata> {
  const page = await safeQuery(
    () => getPageBySlug("testimonials") as Promise<PageData | null>,
    null,
  );
  return {
    title: page?.seo?.title ?? "Testimonials",
    description: page?.seo?.description ?? page?.hero?.subtitle,
  };
}

export default async function TestimonialsPage() {
  const [page, testimonials] = await Promise.all([
    safeQuery(
      () => getPageBySlug("testimonials") as Promise<PageData | null>,
      null,
    ),
    safeQuery(() => getTestimonials() as Promise<TestimonialData[]>, []),
  ]);

  return (
    <>
      <PageHeroBlock hero={page?.hero} fallbackTitle="Client Voices" />
      <TestimonialCarousel
        testimonials={testimonials}
        eyebrow={page?.hero?.eyebrow || "Client Stories"}
        title={page?.hero?.title || "What Clients Say"}
        className="border-t border-white/5"
      />
    </>
  );
}
