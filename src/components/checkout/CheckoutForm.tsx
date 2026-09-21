"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useCartStore } from "@/lib/cart/store";
import { formatMoney } from "@/lib/money";
import { checkoutSchema, type CheckoutInput } from "@/lib/validation/order";

type CheckoutFormProps = {
  currency?: string;
};

export function CheckoutForm({ currency = "USD" }: CheckoutFormProps) {
  const items = useCartStore((s) => s.items);
  const subtotalMinor = useCartStore((s) => s.subtotalMinor());
  const clearCart = useCartStore((s) => s.clearCart);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer: { name: "", email: "", phone: "" },
      shipping: {
        line1: "",
        line2: "",
        city: "",
        region: "",
        postalCode: "",
        country: "United States",
        notes: "",
      },
      items: [],
    },
  });

  if (orderNumber) {
    return (
      <div className="border border-border bg-cream/60 px-8 py-12 text-center">
        <p className="eyebrow text-gold">Order received</p>
        <h2 className="mt-4 font-display text-3xl text-ink">Thank you</h2>
        <p className="mt-4 text-muted">
          Your order <strong>{orderNumber}</strong> is confirmed. Payment is pending — our
          atelier will contact you with secure payment instructions.
        </p>
        <Link href="/shop" className="btn-primary mt-8 inline-flex no-underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="text-center">
        <p className="font-display text-2xl">Your cart is empty</p>
        <Link href="/shop" className="btn-primary mt-6 inline-flex no-underline">
          Return to shop
        </Link>
      </div>
    );
  }

  async function onSubmit(data: CheckoutInput) {
    setStatus("loading");
    setError("");
    try {
      const payload: CheckoutInput = {
        ...data,
        items: items.map((item) => ({
          productId: item.productId,
          variantLabel: item.variantLabel,
          quantity: item.quantity,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? "Unable to place order");
      }
      setOrderNumber(json.orderNumber);
      clearCart();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setStatus((s) => (s === "loading" ? "idle" : s));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-12 lg:grid-cols-[1fr_360px]">
      <div className="space-y-10">
        <section>
          <h2 className="font-display text-2xl">Contact</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Field label="Full name" error={errors.customer?.name?.message}>
              <input {...register("customer.name")} className="field-input" />
            </Field>
            <Field label="Email" error={errors.customer?.email?.message}>
              <input {...register("customer.email")} type="email" className="field-input" />
            </Field>
            <Field label="Phone" error={errors.customer?.phone?.message}>
              <input {...register("customer.phone")} className="field-input" />
            </Field>
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl">Shipping</h2>
          <div className="mt-5 grid gap-5">
            <Field label="Address line 1" error={errors.shipping?.line1?.message}>
              <input {...register("shipping.line1")} className="field-input" />
            </Field>
            <Field label="Address line 2" error={errors.shipping?.line2?.message}>
              <input {...register("shipping.line2")} className="field-input" />
            </Field>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="City" error={errors.shipping?.city?.message}>
                <input {...register("shipping.city")} className="field-input" />
              </Field>
              <Field label="Region / State" error={errors.shipping?.region?.message}>
                <input {...register("shipping.region")} className="field-input" />
              </Field>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Postal code" error={errors.shipping?.postalCode?.message}>
                <input {...register("shipping.postalCode")} className="field-input" />
              </Field>
              <Field label="Country" error={errors.shipping?.country?.message}>
                <input {...register("shipping.country")} className="field-input" />
              </Field>
            </div>
            <Field label="Delivery notes" error={errors.shipping?.notes?.message}>
              <textarea {...register("shipping.notes")} rows={3} className="field-input resize-y" />
            </Field>
          </div>
        </section>

        <p className="rounded border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-ink-soft">
          Payment is handled offline after order review. Do not enter card numbers here —
          our team will send secure payment instructions.
        </p>
      </div>

      <aside className="h-fit border border-border bg-cream/50 p-6">
        <p className="eyebrow">Summary</p>
        <ul className="mt-4 space-y-3 text-sm">
          {items.map((item) => (
            <li key={`${item.productId}-${item.variantLabel}`} className="flex justify-between gap-4">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatMoney(item.unitPriceMinor * item.quantity, currency)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 font-display text-2xl">
          {formatMoney(subtotalMinor, currency)}
        </p>
        <button type="submit" className="btn-primary mt-8 w-full" disabled={status === "loading"}>
          {status === "loading" ? "Placing order…" : "Place order"}
        </button>
        {error ? <p className="mt-3 text-sm text-coral">{error}</p> : null}
      </aside>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="eyebrow mb-2 block">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-sm text-coral">{error}</span> : null}
    </label>
  );
}
