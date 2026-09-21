"use server";

import { revalidatePath, revalidateTag } from "next/cache";
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
import {
  imageMetaSchema,
  pageHeroSchema,
  pageSectionSchema,
  seoSchema,
} from "@/lib/validation/admin-shared";
import { Page } from "@/models";

const pageUpdateSchema = z.object({
  slug: z.string().trim().min(1),
  title: z.string().trim().min(1).max(200),
  status: z.enum(["published", "draft"]).default("published"),
  hero: pageHeroSchema.optional(),
  sections: z.array(pageSectionSchema).default([]),
  seo: seoSchema.optional(),
});

export async function getAdminPages() {
  await requireSession();
  await connectDB();
  const pages = await Page.find().sort({ title: 1 }).lean();
  return serializeDoc(pages);
}

export async function getAdminPage(slug: string) {
  await requireSession();
  await connectDB();
  const page = await Page.findOne({ slug }).lean();
  if (!page) return null;
  return serializeDoc(page);
}

export async function savePage(
  input: z.infer<typeof pageUpdateSchema>,
): Promise<ActionResult> {
  try {
    const session = await requireSession();
    await connectDB();
    const parsed = pageUpdateSchema.safeParse(input);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Invalid page data");
    }

    const { slug, ...data } = parsed.data;
    const page = await Page.findOneAndUpdate(
      { slug },
      {
        $set: {
          ...data,
          updatedBy: session.email,
        },
      },
      { new: true },
    );

    if (!page) {
      return actionError("Page not found");
    }

    revalidatePublicContent([page.route]);
    revalidatePath(`/admin/pages/${slug}`);
    revalidateTag(`page-${slug}`, "max");
    return actionSuccess(undefined, "Page saved");
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return actionError("Unauthorized");
    }
    return actionError("Failed to save page");
  }
}

export async function reorderPageSection(
  slug: string,
  sectionId: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  try {
    await requireSession();
    await connectDB();
    const page = await Page.findOne({ slug });
    if (!page) return actionError("Page not found");

    const sections = [...(page.sections ?? [])].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
    const index = sections.findIndex((s) => String(s._id) === sectionId);
    if (index === -1) return actionError("Section not found");

    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= sections.length) {
      return actionSuccess(undefined, "No change");
    }

    [sections[index], sections[target]] = [sections[target], sections[index]];
    page.sections = sections.map((s, i) => {
      s.order = i;
      return s;
    });
    await page.save();

    revalidatePublicContent([page.route]);
    return actionSuccess(undefined, "Section reordered");
  } catch {
    return actionError("Failed to reorder section");
  }
}

export async function updatePageSectionImage(
  slug: string,
  sectionId: string,
  images: z.infer<typeof imageMetaSchema>[],
): Promise<ActionResult> {
  try {
    await requireSession();
    await connectDB();
    const parsed = z.array(imageMetaSchema).safeParse(images);
    if (!parsed.success) return actionError("Invalid images");

    const page = await Page.findOne({ slug });
    if (!page) return actionError("Page not found");

    const section = page.sections?.find(
      (s: { _id?: { toString(): string } }) => String(s._id) === sectionId,
    );
    if (!section) return actionError("Section not found");

    section.images = parsed.data;
    await page.save();
    revalidatePublicContent([page.route]);
    return actionSuccess(undefined, "Images updated");
  } catch {
    return actionError("Failed to update images");
  }
}
