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
import { imageMetaSchema, slugSchema } from "@/lib/validation/admin-shared";
import { GalleryCategory, GalleryImage } from "@/models";

const categorySchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: slugSchema,
  description: z.string().default(""),
  sortOrder: z.number().int().default(0),
  status: z.enum(["published", "draft"]).default("published"),
});

const imageSchema = z.object({
  categoryId: z.string().trim().min(1),
  image: imageMetaSchema,
  title: z.string().default(""),
  caption: z.string().default(""),
  featured: z.boolean().default(false),
  orientation: z
    .enum(["portrait", "landscape", "square", "auto"])
    .default("auto"),
  sortOrder: z.number().int().default(0),
  status: z.enum(["published", "draft"]).default("published"),
});

export async function getGalleryCategories() {
  await requireSession();
  await connectDB();
  const categories = await GalleryCategory.find()
    .sort({ sortOrder: 1, name: 1 })
    .lean();
  return serializeDoc(categories);
}

export async function getGalleryCategory(id: string) {
  await requireSession();
  await connectDB();
  const category = await GalleryCategory.findById(id).lean();
  if (!category) return null;
  const images = await GalleryImage.find({ categoryId: id })
    .sort({ sortOrder: 1 })
    .lean();
  return { category: serializeDoc(category), images: serializeDoc(images) };
}

export async function createGalleryCategory(
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
      Boolean(await GalleryCategory.exists({ slug: s })),
    );

    const category = await GalleryCategory.create({ ...parsed.data, slug });
    revalidatePublicContent(["/gallery"]);
    revalidatePath("/admin/gallery");
    return actionSuccess({ id: String(category._id) }, "Category created");
  } catch {
    return actionError("Failed to create category");
  }
}

export async function updateGalleryCategory(
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

    const category = await GalleryCategory.findByIdAndUpdate(
      id,
      { $set: parsed.data },
      { new: true },
    );
    if (!category) return actionError("Category not found");

    revalidatePublicContent(["/gallery"]);
    revalidatePath("/admin/gallery");
    revalidatePath(`/admin/gallery/${id}`);
    return actionSuccess(undefined, "Category saved");
  } catch {
    return actionError("Failed to update category");
  }
}

export async function deleteGalleryCategory(id: string): Promise<ActionResult> {
  try {
    await requireSession();
    await connectDB();
    await GalleryImage.deleteMany({ categoryId: id });
    const result = await GalleryCategory.findByIdAndDelete(id);
    if (!result) return actionError("Category not found");

    revalidatePublicContent(["/gallery"]);
    revalidatePath("/admin/gallery");
    return actionSuccess(undefined, "Category deleted");
  } catch {
    return actionError("Failed to delete category");
  }
}

export async function addGalleryImages(
  items: z.infer<typeof imageSchema>[],
): Promise<ActionResult> {
  try {
    await requireSession();
    await connectDB();
    const parsed = z.array(imageSchema).safeParse(items);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Invalid images");
    }

    await GalleryImage.insertMany(parsed.data);
    revalidatePublicContent(["/gallery"]);
    return actionSuccess(undefined, "Images added");
  } catch {
    return actionError("Failed to add images");
  }
}

export async function updateGalleryImage(
  id: string,
  input: Partial<z.infer<typeof imageSchema>>,
): Promise<ActionResult> {
  try {
    await requireSession();
    await connectDB();
    const parsed = imageSchema.partial().safeParse(input);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Invalid image");
    }

    const image = await GalleryImage.findByIdAndUpdate(
      id,
      { $set: parsed.data },
      { new: true },
    );
    if (!image) return actionError("Image not found");

    revalidatePublicContent(["/gallery"]);
    return actionSuccess(undefined, "Image saved");
  } catch {
    return actionError("Failed to update image");
  }
}

export async function deleteGalleryImage(id: string): Promise<ActionResult> {
  try {
    await requireSession();
    await connectDB();
    const image = await GalleryImage.findByIdAndDelete(id);
    if (!image) return actionError("Image not found");

    revalidatePublicContent(["/gallery"]);
    return actionSuccess(undefined, "Image deleted");
  } catch {
    return actionError("Failed to delete image");
  }
}

export async function reorderGalleryImages(
  categoryId: string,
  orderedIds: string[],
): Promise<ActionResult> {
  try {
    await requireSession();
    await connectDB();

    await Promise.all(
      orderedIds.map((id, index) =>
        GalleryImage.updateOne(
          { _id: id, categoryId },
          { $set: { sortOrder: index } },
        ),
      ),
    );

    revalidatePublicContent(["/gallery"]);
    return actionSuccess(undefined, "Order saved");
  } catch {
    return actionError("Failed to reorder images");
  }
}

export async function moveGalleryImage(
  id: string,
  newCategoryId: string,
): Promise<ActionResult> {
  try {
    await requireSession();
    await connectDB();
    const image = await GalleryImage.findByIdAndUpdate(
      id,
      { $set: { categoryId: newCategoryId } },
      { new: true },
    );
    if (!image) return actionError("Image not found");

    revalidatePublicContent(["/gallery"]);
    return actionSuccess(undefined, "Image moved");
  } catch {
    return actionError("Failed to move image");
  }
}

export async function suggestGallerySlug(name: string) {
  await requireSession();
  return makeSlug(name);
}
