"use client";

import { useMemo, useState } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import { Reveal } from "@/components/ui/Reveal";
import { useLightbox } from "@/components/gallery/Lightbox";
import { ProductCard } from "@/components/shop/ProductCard";
import { useCartStore } from "@/lib/cart/store";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { ProductData } from "@/types/cms";

type ProductDetailClientProps = {
  product: ProductData;
  related: ProductData[];
  currency?: string;
};

export function ProductDetailClient({
  product,
  related,
  currency = "USD",
}: ProductDetailClientProps) {
  const addItem = useCartStore((s) => s.addItem);
  const productCurrency = product.currency ?? currency;
  const images = product.images ?? [];
  const lightbox = useLightbox(images);

  const variants = product.variants?.length
    ? product.variants
    : [{ name: "Default", options: [], inventory: product.inventory ?? 0 }];

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  const variant = variants[selectedVariantIndex];
  const unitPriceMinor =
    variant.priceOverrideMinor ?? product.priceMinor;
  const maxInventory = variant.inventory ?? product.inventory ?? 0;
  const variantLabel = useMemo(() => {
    const opts = Object.values(selectedOptions).filter(Boolean);
    return opts.length ? opts.join(" / ") : variant.name;
  }, [selectedOptions, variant.name]);

  function handleAdd() {
    if (maxInventory < 1) return;
    addItem({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      sku: variant.sku || product.sku,
      variantLabel,
      unitPriceMinor,
      quantity,
      imageUrl: images[0]?.url ?? "",
      maxInventory,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div>
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <button
            type="button"
            className="relative aspect-[3/4] w-full overflow-hidden"
            onClick={() => lightbox.open(activeImage)}
            aria-label="Open product gallery"
          >
            <SafeImage
              src={images[activeImage]}
              alt={product.name}
              fill
              priority
              sizes="(max-width:1024px) 100vw, 50vw"
            />
          </button>
          {images.length > 1 ? (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {images.map((image, i) => (
                <button
                  key={i}
                  type="button"
                  className={cn(
                    "relative aspect-square overflow-hidden border-2",
                    activeImage === i ? "border-ink" : "border-transparent",
                  )}
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                >
                  <SafeImage src={image} alt={image.alt} fill sizes="120px" />
                </button>
              ))}
            </div>
          ) : null}
          {lightbox.dialog}
        </div>

        <Reveal>
          <p className="eyebrow text-gold">{product.categories?.[0] ?? "Atelier piece"}</p>
          <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">{product.name}</h1>
          <div className="mt-4 flex items-baseline gap-3">
            <p className="text-xl">{formatMoney(unitPriceMinor, productCurrency)}</p>
            {product.compareAtPriceMinor ? (
              <p className="text-muted line-through">
                {formatMoney(product.compareAtPriceMinor, productCurrency)}
              </p>
            ) : null}
          </div>
          {product.shortDescription ? (
            <p className="mt-6 leading-relaxed text-muted">{product.shortDescription}</p>
          ) : null}

          {product.variants?.length ? (
            <div className="mt-8 space-y-4">
              {product.variants.map((v, vi) =>
                v.options?.length ? (
                  <label key={v._id ?? vi} className="block">
                    <span className="eyebrow mb-2 block">{v.name}</span>
                    <select
                      className="field-input"
                      value={selectedOptions[v.name] ?? v.options[0]}
                      onChange={(e) => {
                        setSelectedOptions((prev) => ({
                          ...prev,
                          [v.name]: e.target.value,
                        }));
                        setSelectedVariantIndex(vi);
                      }}
                    >
                      {v.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null,
              )}
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <label className="block">
              <span className="eyebrow mb-2 block">Quantity</span>
              <input
                type="number"
                min={1}
                max={Math.max(1, maxInventory)}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-24 border border-border bg-ivory px-3 py-2"
              />
            </label>
            <button
              type="button"
              className="btn-primary mt-6"
              onClick={handleAdd}
              disabled={maxInventory < 1}
            >
              {maxInventory < 1 ? "Sold out" : added ? "Added to cart" : "Add to cart"}
            </button>
          </div>

          {product.materialCare ? (
            <div className="mt-10 border-t border-border pt-8">
              <p className="eyebrow">Material & care</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{product.materialCare}</p>
            </div>
          ) : null}
        </Reveal>
      </div>

      {product.editorial?.body || product.editorial?.images?.length ? (
        <section className="section-pad mt-8 border-t border-border">
          <Reveal className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="eyebrow">Editorial</p>
              <h2 className="mt-3 font-display text-3xl">
                {product.editorial?.title || "The making of"}
              </h2>
              {product.editorial?.body ? (
                <p className="mt-4 leading-relaxed text-muted">{product.editorial.body}</p>
              ) : null}
            </div>
            <div className="relative aspect-[4/5] overflow-hidden">
              <SafeImage
                src={product.editorial?.images?.[0] ?? images[0]}
                alt={product.name}
                fill
                sizes="50vw"
              />
            </div>
          </Reveal>
        </section>
      ) : null}

      {related.length ? (
        <section className="section-pad border-t border-border">
          <h2 className="font-display text-3xl">You may also love</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item._id} product={item} currency={currency} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
