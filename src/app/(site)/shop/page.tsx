import type { Metadata } from "next";
import { ServicesHero } from "@/components/services/ServicesHero";
import { ShopCatalog } from "@/components/shop/ShopCatalog";
import { Marquee } from "@/components/motion/marquee";
import { getSettings } from "@/lib/queries/settings";
import { getPublishedProducts } from "@/lib/queries/catalog";
import { getPageBySlug } from "@/lib/queries/pages";
import { safeQuery } from "@/lib/safe-query";
import type { PageData, ProductData } from "@/types/cms";
import type { FooterSettings } from "@/components/site/Footer";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Shop",
    description:
      "Shop LUCCI CRENO — hats, t-shirts, sweatshirts, denim, and trousers.",
  };
}

export default async function ShopPage() {
  const [page, products, settings] = await Promise.all([
    safeQuery(() => getPageBySlug("shop") as Promise<PageData | null>, null),
    safeQuery(() => getPublishedProducts() as Promise<ProductData[]>, []),
    safeQuery(() => getSettings() as Promise<FooterSettings>, {}),
  ]);

  return (
    <>
      <ServicesHero
        eyebrow={page?.hero?.eyebrow || "Collection"}
        title={page?.hero?.title || "The Shop"}
        subtitle={
          page?.hero?.subtitle ||
          "Hats, tees, sweaters, sweatsuits, and denim — genuine luxury you wear."
        }
        background={
          page?.hero?.background ?? {
            url: "/uploads/pages/shop-hero.png",
            alt: "LUCCI CRENO collection on a clothing rack",
          }
        }
      />

      <Marquee
        items={[
          "Hats",
          "T-Shirts",
          "Sweatshirts",
          "Denim",
          "Trousers",
          "LUCCICRENO",
        ]}
        speed={34}
      />

      <div className="container-wide section-pad">
        <ShopCatalog
          products={products}
          currency={settings.currency ?? "USD"}
        />
      </div>
    </>
  );
}
