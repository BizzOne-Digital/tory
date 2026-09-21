import { Schema, type InferSchemaType } from "mongoose";
import { getModel } from "@/lib/db/models-guard";
import { ContentBlockSchema, ImageMetaSchema, SeoSchema } from "./shared";

const BlogPostSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, default: "" },
    coverImage: { type: ImageMetaSchema },
    author: { type: String, default: "LUCCI CRENO Atelier" },
    category: { type: String, default: "Journal" },
    tags: { type: [String], default: [] },
    publishDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["published", "draft", "scheduled", "archived"],
      default: "draft",
      index: true,
    },
    blocks: { type: [ContentBlockSchema], default: [] },
    seo: { type: SeoSchema, default: () => ({}) },
    readingMinutes: { type: Number, default: 4 },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true },
);

BlogPostSchema.index({ title: "text", excerpt: "text", tags: "text" });

export type BlogPostDocument = InferSchemaType<typeof BlogPostSchema>;
export const BlogPost = getModel("BlogPost", BlogPostSchema);
