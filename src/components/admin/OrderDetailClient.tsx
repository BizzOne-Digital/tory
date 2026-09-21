"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  updateOrderPaymentStatus,
  updateOrderStatus,
} from "@/app/admin/actions/orders";
import { FormField } from "@/components/admin/FormField";
import { PageHeader } from "@/components/admin/PageHeader";
import { SaveBar } from "@/components/admin/SaveBar";
import { Select } from "@/components/admin/Select";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { TextArea } from "@/components/admin/TextArea";
import { TextInput } from "@/components/admin/TextInput";
import { useToast } from "@/components/admin/Toast";
import { formatMoney } from "@/lib/money";

type OrderDetailProps = {
  order: {
    _id: string;
    orderNumber: string;
    status: string;
    currency?: string;
    subtotalMinor: number;
    discountMinor?: number;
    shippingMinor?: number;
    totalMinor: number;
    customer: { name: string; email: string; phone?: string };
    shipping: {
      line1: string;
      line2?: string;
      city: string;
      region?: string;
      postalCode: string;
      country: string;
      notes?: string;
    };
    items: {
      name: string;
      sku?: string;
      variantLabel?: string;
      unitPriceMinor: number;
      quantity: number;
      lineTotalMinor: number;
    }[];
    payment?: { status?: string; reference?: string };
    statusHistory?: {
      status: string;
      note?: string;
      at?: string;
      by?: string;
    }[];
    createdAt?: string;
  };
};

export function OrderDetailClient({ order }: OrderDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState(order.status);
  const [note, setNote] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(
    order.payment?.status ?? "pending",
  );
  const [paymentRef, setPaymentRef] = useState(order.payment?.reference ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    const statusResult = await updateOrderStatus(order._id, status as never, note);
    if (!statusResult.ok) {
      setSaving(false);
      setError(statusResult.error);
      toast(statusResult.error, "error");
      return;
    }

    const paymentResult = await updateOrderPaymentStatus(
      order._id,
      paymentStatus as never,
      paymentRef,
    );
    setSaving(false);
    if (!paymentResult.ok) {
      setError(paymentResult.error);
      toast(paymentResult.error, "error");
      return;
    }

    setSaved(true);
    toast("Order updated", "success");
    router.refresh();
  }

  return (
    <div>
      <PageHeader
        title={`Order ${order.orderNumber}`}
        description={`Placed ${order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}`}
        backHref="/admin/orders"
        backLabel="All orders"
        actions={<StatusBadge status={order.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-sm border border-border bg-white p-5 lg:col-span-2">
          <h2 className="font-display text-xl text-ink">Line items (snapshot)</h2>
          <ul className="mt-4 divide-y divide-border">
            {order.items.map((item, index) => (
              <li key={index} className="flex justify-between gap-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted">
                    {item.sku}
                    {item.variantLabel ? ` · ${item.variantLabel}` : ""} ×{" "}
                    {item.quantity}
                  </p>
                </div>
                <p>{formatMoney(item.lineTotalMinor, order.currency)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatMoney(order.subtotalMinor, order.currency)}</dd>
            </div>
            {order.discountMinor ? (
              <div className="flex justify-between">
                <dt>Discount</dt>
                <dd>-{formatMoney(order.discountMinor, order.currency)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>{formatMoney(order.shippingMinor ?? 0, order.currency)}</dd>
            </div>
            <div className="flex justify-between font-medium">
              <dt>Total</dt>
              <dd>{formatMoney(order.totalMinor, order.currency)}</dd>
            </div>
          </dl>
        </section>

        <section className="space-y-6">
          <div className="rounded-sm border border-border bg-white p-5">
            <h2 className="font-display text-lg text-ink">Customer</h2>
            <p className="mt-3 text-sm">{order.customer.name}</p>
            <p className="text-sm text-muted">{order.customer.email}</p>
            {order.customer.phone ? (
              <p className="text-sm text-muted">{order.customer.phone}</p>
            ) : null}
          </div>

          <div className="rounded-sm border border-border bg-white p-5">
            <h2 className="font-display text-lg text-ink">Shipping</h2>
            <p className="mt-3 text-sm">
              {order.shipping.line1}
              {order.shipping.line2 ? `, ${order.shipping.line2}` : ""}
              <br />
              {order.shipping.city}, {order.shipping.region}{" "}
              {order.shipping.postalCode}
              <br />
              {order.shipping.country}
            </p>
            {order.shipping.notes ? (
              <p className="mt-2 text-xs text-muted">{order.shipping.notes}</p>
            ) : null}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-sm border border-border bg-white p-5">
        <h2 className="font-display text-xl text-ink">Update status</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FormField label="Order status">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </FormField>
          <FormField label="Payment status">
            <Select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="authorized">Authorized</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </Select>
          </FormField>
          <FormField label="Status note" className="sm:col-span-2">
            <TextArea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
          </FormField>
          <FormField label="Payment reference">
            <TextInput
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
            />
          </FormField>
        </div>
      </section>

      {order.statusHistory?.length ? (
        <section className="mt-6 rounded-sm border border-border bg-white p-5">
          <h2 className="font-display text-lg text-ink">Status history</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {[...order.statusHistory].reverse().map((entry, index) => (
              <li key={index} className="flex justify-between gap-4">
                <span>
                  <StatusBadge status={entry.status} />{" "}
                  {entry.note ? `— ${entry.note}` : ""}
                </span>
                <span className="text-muted">
                  {entry.at ? new Date(entry.at).toLocaleString() : ""} ·{" "}
                  {entry.by}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <SaveBar
        saving={saving}
        saved={saved}
        error={error}
        onSave={() => void handleSave()}
        label="Update order"
      />
    </div>
  );
}
