import type { Metadata } from "next";
import { PageHeroBlock } from "@/components/content/PageHero";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { getPageBySlug } from "@/lib/queries/pages";
import { getGalleryData } from "@/lib/queries/catalog";
import { safeQuery } from "@/lib/safe-query";
import type { GalleryCategoryData, GalleryImageData, PageData } from "@/types/cms";

export async function generateMetadata(): Promise<Metadata> {
  const page = await safeQuery(
    () => getPageBySlug("gallery") as Promise<PageData | null>,
    null,
  );
  return {
    title: page?.seo?.title ?? "Gallery",
    description: page?.seo?.description ?? page?.hero?.subtitle,
  };
}

export default async function GalleryPage() {
  const [page, gallery] = await Promise.all([
    safeQuery(() => getPageBySlug("gallery") as Promise<PageData | null>, null),
    safeQuery(
      () =>
        getGalleryData() as Promise<{
          categories: GalleryCategoryData[];
          images: GalleryImageData[];
        }>,
      { categories: [], images: [] },
    ),
  ]);

  return (
    <>
      <PageHeroBlock hero={page?.hero} fallbackTitle="Visual Journal" />
      <div className="container-wide section-pad">
        {gallery.images.length ? (
          <GalleryGrid categories={gallery.categories} images={gallery.images} />
        ) : (
          <p className="text-center text-muted">Gallery imagery coming soon.</p>
        )}
      </div>
    </>
  );
}
