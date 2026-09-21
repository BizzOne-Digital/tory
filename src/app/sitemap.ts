import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/utils";
import {
  getPublishedProducts,
  getPublishedServices,
} from "@/lib/queries/catalog";
import { safeQuery } from "@/lib/safe-query";
import type { ProductData, ServiceData } from "@/types/cms";

const STATIC_ROUTES = [
  "",
  "/about",
  "/shop",
  "/services",
  "/testimonials",
  "/faq",
  "/contact",
  "/cart",
  "/checkout",
  "/privacy",
  "/terms",
  "/shipping",
  "/returns",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, services] = await Promise.all([
    safeQuery(() => getPublishedProducts() as Promise<ProductData[]>, []),
    safeQuery(() => getPublishedServices() as Promise<ServiceData[]>, []),
  ]);

  const now = new Date();

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: absoluteUrl(route || "/"),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/shop/${product.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...services.map((service) => ({
      url: absoluteUrl(`/services/${service.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
