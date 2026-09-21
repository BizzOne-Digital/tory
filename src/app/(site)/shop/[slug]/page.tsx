import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/shop/ProductDetailClient";
import { getProductBySlug, getPublishedProducts } from "@/lib/queries/catalog";
import { getSettings } from "@/lib/queries/settings";
import { safeQuery } from "@/lib/safe-query";
import type { ProductData } from "@/types/cms";
import type { FooterSettings } from "@/components/site/Footer";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await safeQuery(
    () => getProductBySlug(slug) as Promise<ProductData | null>,
    null,
  );
  if (!product) return { title: "Product not found" };
  return {
    title: product.seo?.title ?? product.name,
    description: product.seo?.description ?? product.shortDescription,
    openGraph: {
      images: product.images?.[0]?.url ? [product.images[0].url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, allProducts, settings] = await Promise.all([
    safeQuery(() => getProductBySlug(slug) as Promise<ProductData | null>, null),
    safeQuery(() => getPublishedProducts() as Promise<ProductData[]>, []),
    safeQuery(() => getSettings() as Promise<FooterSettings>, {}),
  ]);

  if (!product) notFound();

  const related = allProducts
    .filter(
      (p) =>
        p._id !== product._id &&
        p.categories?.some((c) => product.categories?.includes(c)),
    )
    .slice(0, 4);

  return (
    <div className="container-wide section-pad">
      <ProductDetailClient
        product={product}
        related={related}
        currency={settings.currency ?? "USD"}
      />
    </div>
  );
}
