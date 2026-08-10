"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/utils";
import type { ProductData } from "@/types/cms";

export const SHOP_SECTIONS = [
  {
    id: "hats",
    label: "Hats",
    description: "Finishing touches — structured, soft, and sun-ready.",
  },
  {
    id: "t-shirts",
    label: "T-Shirts",
    description: "Essential layers with atelier ease.",
  },
  {
    id: "sweaters",
    label: "Sweaters",
    description: "Knitwear for quiet warmth and polish.",
  },
  {
    id: "sweatsuits",
    label: "Sweatsuits",
    description: "Leisure sets refined for everyday luxury.",
  },
  {
    id: "denim",
    label: "Denim",
    description: "Washes and silhouettes built to last.",
  },
] as const;

type ShopCatalogProps = {
  products: ProductData[];
  currency?: string;
};

function matchesSection(product: ProductData, label: string) {
  return product.categories?.some(
    (c) => c.toLowerCase() === label.toLowerCase(),
  );
}

export function ShopCatalog({ products, currency = "USD" }: ShopCatalogProps) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortDescription?.toLowerCase().includes(q) ||
        p.categories?.some((c) => c.toLowerCase().includes(q)) ||
        p.tags?.some((t) => t.toLowerCase().includes(q)),
    );
  }, [products, query]);

  const sections = useMemo(() => {
    return SHOP_SECTIONS.map((section) => ({
      ...section,
      items: filtered.filter((p) => matchesSection(p, section.label)),
    })).filter((section) => {
      if (active === "all") return section.items.length > 0;
      return section.id === active && section.items.length > 0;
    });
  }, [filtered, active]);

  const orphanItems = useMemo(() => {
    const known = new Set(
      SHOP_SECTIONS.map((s) => s.label.toLowerCase()),
    );
    return filtered.filter(
      (p) => !p.categories?.some((c) => known.has(c.toLowerCase())),
    );
  }, [filtered]);

  function scrollToSection(id: string) {
    setActive(id === active && id !== "all" ? "all" : id);
    if (id === "all") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    requestAnimationFrame(() => {
      document
        .getElementById(`shop-${id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <div className="w-full min-w-0">
      <div className="mb-8 space-y-5 sm:mb-10">
        <label className="block">
          <span className="eyebrow mb-2 block">Search</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hats, tees, denim…"
            className="w-full border border-border bg-ivory px-4 py-3 text-sm outline-none focus:border-gold"
          />
        </label>

        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <button
            type="button"
            onClick={() => scrollToSection("all")}
            className={cn(
              "shrink-0 border px-4 py-2 text-[0.68rem] uppercase tracking-[0.18em] transition-colors",
              active === "all"
                ? "border-ink bg-ink text-ivory"
                : "border-border bg-cream/60 text-ink hover:border-ink",
            )}
          >
            All
          </button>
          {SHOP_SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              className={cn(
                "shrink-0 border px-4 py-2 text-[0.68rem] uppercase tracking-[0.18em] transition-colors",
                active === section.id
                  ? "border-ink bg-ink text-ivory"
                  : "border-border bg-cream/60 text-ink hover:border-ink",
              )}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {sections.length === 0 && orphanItems.length === 0 ? (
        <div className="border border-dashed border-border px-6 py-16 text-center sm:px-8 sm:py-20">
          <p className="font-display text-2xl text-ink">No pieces found</p>
          <p className="mt-3 text-muted">
            Try another search or browse every category.
          </p>
        </div>
      ) : null}

      <div className="space-y-16 sm:space-y-20">
        {sections.map((section) => (
          <section
            key={section.id}
            id={`shop-${section.id}`}
            className="scroll-mt-28"
          >
            <div className="mb-8 flex flex-col gap-2 border-b border-border/70 pb-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="eyebrow text-gold">{section.label}</p>
                <h2 className="mt-2 font-display text-3xl text-ink md:text-4xl">
                  {section.label}
                </h2>
                <p className="mt-2 max-w-lg text-sm text-muted sm:text-base">
                  {section.description}
                </p>
              </div>
              <p className="shrink-0 text-[0.68rem] uppercase tracking-[0.2em] text-muted">
                {section.items.length}{" "}
                {section.items.length === 1 ? "piece" : "pieces"}
              </p>
            </div>

            <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {section.items.map((product, i) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  currency={currency}
                  priority={i < 2}
                />
              ))}
            </div>
          </section>
        ))}

        {active === "all" && orphanItems.length > 0 ? (
          <section id="shop-more" className="scroll-mt-28">
            <div className="mb-8 border-b border-border/70 pb-5">
              <p className="eyebrow text-gold">More</p>
              <h2 className="mt-2 font-display text-3xl text-ink">
                Additional pieces
              </h2>
            </div>
            <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {orphanItems.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  currency={currency}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
