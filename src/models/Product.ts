import { Schema, type InferSchemaType } from "mongoose";
import { getModel } from "@/lib/db/models-guard";
import { ImageMetaSchema, SeoSchema } from "./shared";

const VariantSchema = new Schema(
  {
    name: { type: String, required: true },
    options: { type: [String], default: [] },
    sku: { type: String, default: "" },
    priceOverrideMinor: { type: Number },
    inventory: { type: Number, default: 0 },
  },
  { _id: true },
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    sku: { type: String, required: true, unique: true, index: true },
    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
    priceMinor: { type: Number, required: true, min: 0 },
    compareAtPriceMinor: { type: Number, min: 0 },
    currency: { type: String, default: "USD" },
    categories: { type: [String], default: [] },
    collections: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    images: { type: [ImageMetaSchema], default: [] },
    variants: { type: [VariantSchema], default: [] },
    materialCare: { type: String, default: "" },
    shippingReturns: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    seasonal: { type: Boolean, default: false },
    inventory: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["published", "draft", "archived"],
      default: "draft",
      index: true,
    },
    sortOrder: { type: Number, default: 0 },
    seo: { type: SeoSchema, default: () => ({}) },
    editorial: {
      title: { type: String, default: "" },
      body: { type: String, default: "" },
      images: { type: [ImageMetaSchema], default: [] },
    },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true },
);

ProductSchema.index({ name: "text", shortDescription: "text", tags: "text" });

export type ProductDocument = InferSchemaType<typeof ProductSchema>;
export const Product = getModel("Product", ProductSchema);
