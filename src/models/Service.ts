import { Schema, type InferSchemaType } from "mongoose";
import { getModel } from "@/lib/db/models-guard";
import { ContentBlockSchema, ImageMetaSchema, SeoSchema } from "./shared";

const ServiceSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    shortDescription: { type: String, default: "" },
    mainImage: { type: ImageMetaSchema },
    ctaLabel: { type: String, default: "Explore" },
    featured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["published", "draft", "archived"],
      default: "draft",
      index: true,
    },
    detail: {
      hero: {
        eyebrow: { type: String, default: "" },
        title: { type: String, default: "" },
        subtitle: { type: String, default: "" },
        background: { type: ImageMetaSchema },
        image: { type: ImageMetaSchema },
      },
      longIntroduction: { type: String, default: "" },
      sections: { type: [ContentBlockSchema], default: [] },
      seo: { type: SeoSchema, default: () => ({}) },
    },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true },
);

export type ServiceDocument = InferSchemaType<typeof ServiceSchema>;
export const Service = getModel("Service", ServiceSchema);
