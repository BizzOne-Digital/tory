"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  sku: string;
  variantLabel: string;
  unitPriceMinor: number;
  quantity: number;
  imageUrl: string;
  maxInventory: number;
};

type CartState = {
  items: CartItem[];
  addItem: (
    item: Omit<CartItem, "quantity"> & { quantity?: number },
  ) => void;
  removeItem: (productId: string, variantLabel: string) => void;
  updateQuantity: (
    productId: string,
    variantLabel: string,
    quantity: number,
  ) => void;
  clearCart: () => void;
  itemCount: () => number;
  subtotalMinor: () => number;
};

function itemKey(productId: string, variantLabel: string) {
  return `${productId}::${variantLabel}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const quantity = Math.min(
          Math.max(1, item.quantity ?? 1),
          item.maxInventory,
        );
        const key = itemKey(item.productId, item.variantLabel);

        set((state) => {
          const existing = state.items.find(
            (line) => itemKey(line.productId, line.variantLabel) === key,
          );

          if (existing) {
            const nextQty = Math.min(
              existing.quantity + quantity,
              existing.maxInventory,
            );
            return {
              items: state.items.map((line) =>
                itemKey(line.productId, line.variantLabel) === key
                  ? { ...line, quantity: nextQty }
                  : line,
              ),
            };
          }

          return {
            items: [...state.items, { ...item, quantity }],
          };
        });
      },

      removeItem: (productId, variantLabel) => {
        const key = itemKey(productId, variantLabel);
        set((state) => ({
          items: state.items.filter(
            (line) => itemKey(line.productId, line.variantLabel) !== key,
          ),
        }));
      },

      updateQuantity: (productId, variantLabel, quantity) => {
        const key = itemKey(productId, variantLabel);

        if (quantity < 1) {
          get().removeItem(productId, variantLabel);
          return;
        }

        set((state) => ({
          items: state.items.map((line) => {
            if (itemKey(line.productId, line.variantLabel) !== key) {
              return line;
            }
            return {
              ...line,
              quantity: Math.min(quantity, line.maxInventory),
            };
          }),
        }));
      },

      clearCart: () => set({ items: [] }),

      itemCount: () =>
        get().items.reduce((total, line) => total + line.quantity, 0),

      subtotalMinor: () =>
        get().items.reduce(
          (total, line) => total + line.unitPriceMinor * line.quantity,
          0,
        ),
    }),
    { name: "lc-cart" },
  ),
);
