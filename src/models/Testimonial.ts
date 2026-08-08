import { Schema, type InferSchemaType } from "mongoose";
import { getModel } from "@/lib/db/models-guard";
import { ImageMetaSchema } from "./shared";

const TestimonialSchema = new Schema(
  {
    name: { type: String, required: true },
    role: { type: String, default: "" },
    location: { type: String, default: "" },
    quote: { type: String, required: true },
    portrait: { type: ImageMetaSchema },
    featured: { type: Boolean, default: false },
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

export type TestimonialDocument = InferSchemaType<typeof TestimonialSchema>;
export const Testimonial = getModel("Testimonial", TestimonialSchema);
