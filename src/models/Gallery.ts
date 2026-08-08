import { Schema, type InferSchemaType } from "mongoose";
import { getModel } from "@/lib/db/models-guard";
import { ImageMetaSchema } from "./shared";

const GalleryCategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
    },
  },
  { timestamps: true },
);

const GalleryImageSchema = new Schema(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "GalleryCategory",
      required: true,
      index: true,
    },
    image: { type: ImageMetaSchema, required: true },
    title: { type: String, default: "" },
    caption: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    orientation: {
      type: String,
      enum: ["portrait", "landscape", "square", "auto"],
      default: "auto",
    },
    sortOrder: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
    },
  },
  { timestamps: true },
);

export type GalleryCategoryDocument = InferSchemaType<
  typeof GalleryCategorySchema
>;
export type GalleryImageDocument = InferSchemaType<typeof GalleryImageSchema>;

export const GalleryCategory = getModel(
  "GalleryCategory",
  GalleryCategorySchema,
);
export const GalleryImage = getModel("GalleryImage", GalleryImageSchema);
