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
import { makeSlug, uniqueSlug } from "@/lib/slug";
import { slugSchema } from "@/lib/validation/admin-shared";
import { sanitizeRichText } from "@/lib/sanitize-html";
import { Faq, FaqCategory } from "@/models";

const categorySchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: slugSchema,
  sortOrder: z.number().int().default(0),
  status: z.enum(["published", "draft"]).default("published"),
});

const faqSchema = z.object({
  question: z.string().trim().min(1),
  answer: z.string().trim().min(1),
  categoryId: z.string().trim().min(1),
  sortOrder: z.number().int().default(0),
  status: z.enum(["published", "draft"]).default("published"),
});

export async function getFaqCategories() {
  await requireSession();
  await connectDB();
  const categories = await FaqCategory.find()
    .sort({ sortOrder: 1, name: 1 })
    .lean();
  return serializeDoc(categories);
}

export async function getFaqs(categoryId?: string) {
  await requireSession();
  await connectDB();
  const query = categoryId ? { categoryId } : {};
  const faqs = await Faq.find(query).sort({ sortOrder: 1 }).lean();
  return serializeDoc(faqs);
}

export async function getAdminFaq(id: string) {
  await requireSession();
  await connectDB();
  const faq = await Faq.findById(id).lean();
  if (!faq) return null;
  return serializeDoc(faq);
}

export async function createFaqCategory(
  input: z.infer<typeof categorySchema>,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSession();
    await connectDB();
    const parsed = categorySchema.safeParse(input);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Invalid category");
    }

    const slug = await uniqueSlug(parsed.data.slug || parsed.data.name, async (s) =>
      Boolean(await FaqCategory.exists({ slug: s })),
    );

    const category = await FaqCategory.create({ ...parsed.data, slug });
    revalidatePublicContent(["/faq"]);
    revalidatePath("/admin/faqs");
    return actionSuccess({ id: String(category._id) }, "Category created");
  } catch {
    return actionError("Failed to create category");
  }
}

export async function updateFaqCategory(
  id: string,
  input: Partial<z.infer<typeof categorySchema>>,
): Promise<ActionResult> {
  try {
    await requireSession();
    await connectDB();
    const parsed = categorySchema.partial().safeParse(input);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Invalid category");
    }

    const category = await FaqCategory.findByIdAndUpdate(
      id,
      { $set: parsed.data },
      { new: true },
    );
    if (!category) return actionError("Category not found");

    revalidatePublicContent(["/faq"]);
    revalidatePath("/admin/faqs");
    return actionSuccess(undefined, "Category saved");
  } catch {
    return actionError("Failed to update category");
  }
}

export async function deleteFaqCategory(id: string): Promise<ActionResult> {
  try {
    await requireSession();
    await connectDB();
    await Faq.deleteMany({ categoryId: id });
    const category = await FaqCategory.findByIdAndDelete(id);
    if (!category) return actionError("Category not found");

    revalidatePublicContent(["/faq"]);
    revalidatePath("/admin/faqs");
    return actionSuccess(undefined, "Category deleted");
  } catch {
    return actionError("Failed to delete category");
  }
}

export async function createFaq(
  input: z.infer<typeof faqSchema>,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSession();
    await connectDB();
    const parsed = faqSchema.safeParse(input);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Invalid FAQ");
    }

    const faq = await Faq.create({
      ...parsed.data,
      answer: sanitizeRichText(parsed.data.answer),
    });
    revalidatePublicContent(["/faq"]);
    revalidatePath("/admin/faqs");
    return actionSuccess({ id: String(faq._id) }, "FAQ created");
  } catch {
    return actionError("Failed to create FAQ");
  }
}

export async function updateFaq(
  id: string,
  input: Partial<z.infer<typeof faqSchema>>,
): Promise<ActionResult> {
  try {
    await requireSession();
    await connectDB();
    const parsed = faqSchema.partial().safeParse(input);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Invalid FAQ");
    }

    const patch = { ...parsed.data };
    if (patch.answer) patch.answer = sanitizeRichText(patch.answer);

    const faq = await Faq.findByIdAndUpdate(id, { $set: patch }, { new: true });
    if (!faq) return actionError("FAQ not found");

    revalidatePublicContent(["/faq"]);
    revalidatePath("/admin/faqs");
    return actionSuccess(undefined, "FAQ saved");
  } catch {
    return actionError("Failed to update FAQ");
  }
}

export async function deleteFaq(id: string): Promise<ActionResult> {
  try {
    await requireSession();
    await connectDB();
    const faq = await Faq.findByIdAndDelete(id);
    if (!faq) return actionError("FAQ not found");

    revalidatePublicContent(["/faq"]);
    revalidatePath("/admin/faqs");
    return actionSuccess(undefined, "FAQ deleted");
  } catch {
    return actionError("Failed to delete FAQ");
  }
}

export async function suggestFaqCategorySlug(name: string) {
  await requireSession();
  return makeSlug(name);
}
