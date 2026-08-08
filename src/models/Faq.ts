import { Schema, type InferSchemaType } from "mongoose";
import { getModel } from "@/lib/db/models-guard";

const FaqCategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    sortOrder: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
    },
  },
  { timestamps: true },
);

const FaqSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "FaqCategory",
      required: true,
      index: true,
    },
    sortOrder: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
      index: true,
    },
  },
  { timestamps: true },
);

export type FaqCategoryDocument = InferSchemaType<typeof FaqCategorySchema>;
export type FaqDocument = InferSchemaType<typeof FaqSchema>;

export const FaqCategory = getModel("FaqCategory", FaqCategorySchema);
export const Faq = getModel("Faq", FaqSchema);
