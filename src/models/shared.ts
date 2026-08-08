import { Schema, type InferSchemaType } from "mongoose";

export const ImageMetaSchema = new Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: "" },
    caption: { type: String, default: "" },
    width: { type: Number },
    height: { type: Number },
    focalX: { type: Number, min: 0, max: 100 },
    focalY: { type: Number, min: 0, max: 100 },
  },
  { _id: false },
);

export type ImageMeta = InferSchemaType<typeof ImageMetaSchema>;

export const SeoSchema = new Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    ogImage: { type: String, default: "" },
    canonical: { type: String, default: "" },
  },
  { _id: false },
);

export type SeoMeta = InferSchemaType<typeof SeoSchema>;

export const ContentBlockSchema = new Schema(
  {
    type: {
      type: String,
      enum: [
        "text",
        "heading",
        "quote",
        "image",
        "gallery",
        "cta",
        "split",
        "html",
      ],
      required: true,
    },
    eyebrow: { type: String, default: "" },
    heading: { type: String, default: "" },
    body: { type: String, default: "" },
    alignment: {
      type: String,
      enum: ["left", "right", "center", "split-left", "split-right"],
      default: "left",
    },
    ctaLabel: { type: String, default: "" },
    ctaHref: { type: String, default: "" },
    images: { type: [ImageMetaSchema], default: [] },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: true },
);

export type ContentBlock = InferSchemaType<typeof ContentBlockSchema>;
