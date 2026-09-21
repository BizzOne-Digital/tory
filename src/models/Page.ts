import { Schema, type InferSchemaType } from "mongoose";
import { getModel } from "@/lib/db/models-guard";
import { ContentBlockSchema, ImageMetaSchema, SeoSchema } from "./shared";

const PageSectionSchema = new Schema(
  {
    key: { type: String, required: true },
    type: { type: String, required: true },
    title: { type: String, default: "" },
    eyebrow: { type: String, default: "" },
    body: { type: String, default: "" },
    ctaLabel: { type: String, default: "" },
    ctaHref: { type: String, default: "" },
    secondaryCtaLabel: { type: String, default: "" },
    secondaryCtaHref: { type: String, default: "" },
    images: { type: [ImageMetaSchema], default: [] },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: true },
);

const PageSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    route: { type: String, required: true },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
    },
    seo: { type: SeoSchema, default: () => ({}) },
    hero: {
      eyebrow: { type: String, default: "" },
      title: { type: String, default: "" },
      subtitle: { type: String, default: "" },
      body: { type: String, default: "" },
      ctaLabel: { type: String, default: "" },
      ctaHref: { type: String, default: "" },
      secondaryCtaLabel: { type: String, default: "" },
      secondaryCtaHref: { type: String, default: "" },
      background: { type: ImageMetaSchema },
      images: { type: [ImageMetaSchema], default: [] },
    },
    sections: { type: [PageSectionSchema], default: [] },
    blocks: { type: [ContentBlockSchema], default: [] },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true },
);

export type PageDocument = InferSchemaType<typeof PageSchema>;
export const Page = getModel("Page", PageSchema);
