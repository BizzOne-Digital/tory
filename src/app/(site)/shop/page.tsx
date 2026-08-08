import type { Metadata } from "next";
import { PageHeroBlock } from "@/components/content/PageHero";
import { ShopCatalog } from "@/components/shop/ShopCatalog";
import { getSettings } from "@/lib/queries/settings";
import { getPublishedProducts } from "@/lib/queries/catalog";
import { safeQuery } from "@/lib/safe-query";
import type { ProductData } from "@/types/cms";
import type { FooterSettings } from "@/components/site/Footer";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Shop",
    description: "Explore the LUCCI CRENO collection — timeless pieces crafted for enduring elegance.",
  };
}

export default async function ShopPage() {
  const [products, settings] = await Promise.all([
    safeQuery(() => getPublishedProducts() as Promise<ProductData[]>, []),
    safeQuery(() => getSettings() as Promise<FooterSettings>, {}),
  ]);

  return (
    <>
      <PageHeroBlock
        hero={{
          eyebrow: "Collection",
          title: "The Shop",
          subtitle: "Curated silhouettes from the Summer Atelier Edit",
          background: products[0]?.images?.[0],
        }}
        size="compact"
      />
      <div className="container-wide section-pad">
        <ShopCatalog products={products} currency={settings.currency ?? "USD"} />
      </div>
    </>
  );
}
