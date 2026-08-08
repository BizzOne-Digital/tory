"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "./ProductCard";
import type { ProductData } from "@/types/cms";

type ShopCatalogProps = {
  products: ProductData[];
  currency?: string;
};

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

export function ShopCatalog({ products, currency = "USD" }: ShopCatalogProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortKey>("featured");

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.categories?.forEach((c) => set.add(c)));
    return ["all", ...Array.from(set).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q)),
      );
    }

    if (category !== "all") {
      list = list.filter((p) => p.categories?.includes(category));
    }

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.priceMinor - b.priceMinor);
        break;
      case "price-desc":
        list.sort((a, b) => b.priceMinor - a.priceMinor);
        break;
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        list.sort((a, b) => Number(b.featured) - Number(a.featured));
    }

    return list;
  }, [products, query, category, sort]);

  return (
    <div>
      <div className="mb-10 grid gap-4 border border-border/80 bg-cream/50 p-4 md:grid-cols-[1fr_auto_auto] md:items-end">
        <label className="block">
          <span className="eyebrow mb-2 block">Search</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pieces, fabrics, silhouettes…"
            className="w-full border border-border bg-ivory px-4 py-3 text-sm outline-none focus:border-gold"
          />
        </label>
        <label className="block">
          <span className="eyebrow mb-2 block">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-border bg-ivory px-4 py-3 text-sm outline-none focus:border-gold md:min-w-[180px]"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All categories" : cat}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="eyebrow mb-2 block">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="w-full border border-border bg-ivory px-4 py-3 text-sm outline-none focus:border-gold md:min-w-[180px]"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price · Low to high</option>
            <option value="price-desc">Price · High to low</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>

      {filtered.length ? (
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product, i) => (
            <ProductCard
              key={product._id}
              product={product}
              currency={currency}
              priority={i < 4}
            />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-border px-8 py-20 text-center">
          <p className="font-display text-2xl text-ink">No pieces match your search</p>
          <p className="mt-3 text-muted">
            Try another category or explore our full atelier edit.
          </p>
        </div>
      )}
    </div>
  );
}
