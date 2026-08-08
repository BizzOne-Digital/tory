"use client";

import { Reveal } from "@/components/ui/Reveal";
import { SafeImage } from "@/components/ui/SafeImage";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { ProductData } from "@/types/cms";
import Link from "next/link";

type ProductCardProps = {
  product: ProductData;
  currency?: string;
  className?: string;
  priority?: boolean;
};

export function ProductCard({
  product,
  currency = "USD",
  className,
  priority,
}: ProductCardProps) {
  const image = product.images?.[0];
  const hoverImage = product.images?.[1];
  const productCurrency = product.currency ?? currency;

  return (
    <Reveal className={cn("group", className)}>
      <Link href={`/shop/${product.slug}`} className="block no-underline">
        <div className="relative aspect-[3/4] overflow-hidden bg-sand/40">
          <SafeImage
            src={image}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width:768px) 50vw, 25vw"
            className={cn(
              "object-cover transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105",
              hoverImage && "group-hover:opacity-0",
            )}
          />
          {hoverImage ? (
            <SafeImage
              src={hoverImage}
              alt=""
              fill
              sizes="(max-width:768px) 50vw, 25vw"
              className="object-cover opacity-0 scale-105 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-100 group-hover:opacity-100"
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="absolute left-4 top-4 flex flex-col gap-2">
            {product.isNewArrival ? (
              <span className="bg-ivory/90 px-2 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-ink">
                New
              </span>
            ) : null}
            {product.seasonal ? (
              <span className="bg-coral/90 px-2 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-ink">
                Seasonal
              </span>
            ) : null}
          </div>
        </div>
        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg text-ink transition-colors duration-300 group-hover:text-ink-soft">
              {product.name}
            </h3>
            {product.shortDescription ? (
              <p className="mt-1 line-clamp-2 text-sm text-muted">
                {product.shortDescription}
              </p>
            ) : null}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-ink">
              {formatMoney(product.priceMinor, productCurrency)}
            </p>
            {product.compareAtPriceMinor ? (
              <p className="text-xs text-muted line-through">
                {formatMoney(product.compareAtPriceMinor, productCurrency)}
              </p>
            ) : null}
          </div>
        </div>
      </Link>
    </Reveal>
  );
}
