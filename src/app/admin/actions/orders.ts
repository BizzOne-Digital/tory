"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  actionError,
  actionSuccess,
  serializeDoc,
  type ActionResult,
} from "@/lib/admin/action-result";
import { requireSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/models";

const statusSchema = z.enum([
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "completed",
  "cancelled",
]);

const paymentStatusSchema = z.enum([
  "pending",
  "authorized",
  "paid",
  "failed",
  "refunded",
]);

export async function getAdminOrders(filters?: {
  status?: string;
  q?: string;
}) {
  await requireSession();
  await connectDB();

  const query: Record<string, unknown> = {};
  if (filters?.status && filters.status !== "all") {
    query.status = filters.status;
  }
  if (filters?.q?.trim()) {
    const q = filters.q.trim();
    query.$or = [
      { orderNumber: new RegExp(q, "i") },
      { "customer.email": new RegExp(q, "i") },
      { "customer.name": new RegExp(q, "i") },
    ];
  }

  const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
  return serializeDoc(orders);
}

export async function getAdminOrder(id: string) {
  await requireSession();
  await connectDB();
  const order = await Order.findById(id).lean();
  if (!order) return null;
  return serializeDoc(order);
}

export async function updateOrderStatus(
  id: string,
  status: z.infer<typeof statusSchema>,
  note = "",
): Promise<ActionResult> {
  try {
    const session = await requireSession();
    await connectDB();
    const parsed = statusSchema.safeParse(status);
    if (!parsed.success) return actionError("Invalid status");

    const order = await Order.findById(id);
    if (!order) return actionError("Order not found");

    order.status = parsed.data;
    order.statusHistory = order.statusHistory ?? [];
    order.statusHistory.push({
      status: parsed.data,
      note,
      at: new Date(),
      by: session.email,
    });
    await order.save();

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    return actionSuccess(undefined, "Order status updated");
  } catch {
    return actionError("Failed to update order");
  }
}

export async function updateOrderPaymentStatus(
  id: string,
  paymentStatus: z.infer<typeof paymentStatusSchema>,
  reference = "",
): Promise<ActionResult> {
  try {
    await requireSession();
    await connectDB();
    const parsed = paymentStatusSchema.safeParse(paymentStatus);
    if (!parsed.success) return actionError("Invalid payment status");

    const order = await Order.findById(id);
    if (!order) return actionError("Order not found");

    order.payment = order.payment ?? { provider: "manual", status: "pending" };
    order.payment.status = parsed.data;
    if (reference) order.payment.reference = reference;
    await order.save();

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    return actionSuccess(undefined, "Payment status updated");
  } catch {
    return actionError("Failed to update payment status");
  }
}
