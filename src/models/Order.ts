import { Schema, type InferSchemaType } from "mongoose";
import { getModel } from "@/lib/db/models-guard";

const OrderLineSchema = new Schema(
  {
    productId: { type: String, required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    sku: { type: String, default: "" },
    variantLabel: { type: String, default: "" },
    unitPriceMinor: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    lineTotalMinor: { type: Number, required: true },
    imageUrl: { type: String, default: "" },
  },
  { _id: false },
);

const StatusHistorySchema = new Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: "" },
    at: { type: Date, default: Date.now },
    by: { type: String, default: "system" },
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: "" },
    },
    shipping: {
      line1: { type: String, required: true },
      line2: { type: String, default: "" },
      city: { type: String, required: true },
      region: { type: String, default: "" },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      notes: { type: String, default: "" },
    },
    items: { type: [OrderLineSchema], required: true },
    currency: { type: String, default: "USD" },
    subtotalMinor: { type: Number, required: true },
    discountMinor: { type: Number, default: 0 },
    discountLabel: { type: String, default: "" },
    shippingMinor: { type: Number, default: 0 },
    totalMinor: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "completed",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },
    payment: {
      provider: { type: String, default: "manual" },
      status: {
        type: String,
        enum: ["pending", "authorized", "paid", "failed", "refunded"],
        default: "pending",
      },
      reference: { type: String, default: "" },
    },
    statusHistory: { type: [StatusHistorySchema], default: [] },
  },
  { timestamps: true },
);

export type OrderDocument = InferSchemaType<typeof OrderSchema>;
export const Order = getModel("Order", OrderSchema);
