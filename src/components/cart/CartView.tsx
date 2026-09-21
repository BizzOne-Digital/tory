"use client";

import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { useCartStore } from "@/lib/cart/store";
import { formatMoney } from "@/lib/money";

export function CartView({ currency = "USD" }: { currency?: string }) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotalMinor = useCartStore((s) => s.subtotalMinor());

  if (!items.length) {
    return (
      <div className="border border-dashed border-border px-8 py-20 text-center">
        <p className="font-display text-3xl text-ink">Your cart is empty</p>
        <p className="mt-3 text-muted">Discover pieces crafted for enduring elegance.</p>
        <Link href="/shop" className="btn-primary mt-8 inline-flex no-underline">
          Explore the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li key={`${item.productId}-${item.variantLabel}`} className="grid gap-6 py-8 md:grid-cols-[140px_1fr_auto]">
            <div className="relative aspect-[3/4] overflow-hidden bg-sand/30">
              <SafeImage src={item.imageUrl} alt={item.name} fill sizes="140px" />
            </div>
            <div>
              <Link href={`/shop/${item.slug}`} className="font-display text-xl text-ink no-underline">
                {item.name}
              </Link>
              {item.variantLabel ? (
                <p className="mt-1 text-sm text-muted">{item.variantLabel}</p>
              ) : null}
              <p className="mt-2 text-sm">{formatMoney(item.unitPriceMinor, currency)}</p>
              <button
                type="button"
                className="mt-4 text-xs uppercase tracking-[0.18em] text-muted link-underline"
                onClick={() => removeItem(item.productId, item.variantLabel)}
              >
                Remove
              </button>
            </div>
            <div className="flex items-start gap-3">
              <label className="sr-only" htmlFor={`qty-${item.productId}`}>
                Quantity for {item.name}
              </label>
              <input
                id={`qty-${item.productId}`}
                type="number"
                min={1}
                max={item.maxInventory}
                value={item.quantity}
                onChange={(e) =>
                  updateQuantity(
                    item.productId,
                    item.variantLabel,
                    Number(e.target.value),
                  )
                }
                className="w-20 border border-border bg-ivory px-3 py-2 text-sm"
              />
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit border border-border bg-cream/50 p-6">
        <p className="eyebrow">Order summary</p>
        <p className="mt-4 font-display text-3xl text-ink">
          {formatMoney(subtotalMinor, currency)}
        </p>
        <p className="mt-2 text-sm text-muted">Shipping calculated at checkout.</p>
        <Link href="/checkout" className="btn-primary mt-8 flex w-full no-underline">
          Proceed to checkout
        </Link>
      </aside>
    </div>
  );
}
