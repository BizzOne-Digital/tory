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
import { revalidatePublicContent } from "@/lib/revalidate";
import { imageMetaSchema } from "@/lib/validation/admin-shared";
import { Testimonial } from "@/models";

const testimonialSchema = z.object({
  name: z.string().trim().min(1).max(120),
  role: z.string().default(""),
  location: z.string().default(""),
  quote: z.string().trim().min(1),
  portrait: imageMetaSchema.optional(),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  status: z.enum(["published", "draft"]).default("published"),
});

export async function getAdminTestimonials() {
  await requireSession();
  await connectDB();
  const items = await Testimonial.find()
    .sort({ sortOrder: 1, updatedAt: -1 })
    .lean();
  return serializeDoc(items);
}

export async function getAdminTestimonial(id: string) {
  await requireSession();
  await connectDB();
  const item = await Testimonial.findById(id).lean();
  if (!item) return null;
  return serializeDoc(item);
}

export async function createTestimonial(
  input: z.infer<typeof testimonialSchema>,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSession();
    await connectDB();
    const parsed = testimonialSchema.safeParse(input);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Invalid data");
    }

    const item = await Testimonial.create(parsed.data);
    revalidatePublicContent(["/testimonials"]);
    revalidatePath("/admin/testimonials");
    return actionSuccess({ id: String(item._id) }, "Testimonial created");
  } catch {
    return actionError("Failed to create testimonial");
  }
}

export async function updateTestimonial(
  id: string,
  input: Partial<z.infer<typeof testimonialSchema>>,
): Promise<ActionResult> {
  try {
    await requireSession();
    await connectDB();
    const parsed = testimonialSchema.partial().safeParse(input);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Invalid data");
    }

    const item = await Testimonial.findByIdAndUpdate(
      id,
      { $set: parsed.data },
      { new: true },
    );
    if (!item) return actionError("Testimonial not found");

    revalidatePublicContent(["/testimonials"]);
    revalidatePath("/admin/testimonials");
    revalidatePath(`/admin/testimonials/${id}`);
    return actionSuccess(undefined, "Testimonial saved");
  } catch {
    return actionError("Failed to update testimonial");
  }
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  try {
    await requireSession();
    await connectDB();
    const item = await Testimonial.findByIdAndDelete(id);
    if (!item) return actionError("Testimonial not found");

    revalidatePublicContent(["/testimonials"]);
    revalidatePath("/admin/testimonials");
    return actionSuccess(undefined, "Testimonial deleted");
  } catch {
    return actionError("Failed to delete testimonial");
  }
}
