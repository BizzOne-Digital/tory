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
import {
  contentBlockSchema,
  imageMetaSchema,
  pageHeroSchema,
  seoSchema,
  slugSchema,
} from "@/lib/validation/admin-shared";
import { sanitizeRichText } from "@/lib/sanitize-html";
import { Service } from "@/models";

const listingSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: slugSchema,
  shortDescription: z.string().default(""),
  mainImage: imageMetaSchema.optional(),
  ctaLabel: z.string().default("Explore"),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  status: z.enum(["published", "draft", "archived"]).default("draft"),
});

const detailSchema = z.object({
  hero: pageHeroSchema.optional(),
  longIntroduction: z.string().default(""),
  sections: z.array(contentBlockSchema).default([]),
  seo: seoSchema.optional(),
});

const serviceCreateSchema = listingSchema.extend({
  detail: detailSchema.optional(),
});

const serviceUpdateSchema = listingSchema.partial().merge(
  z.object({ detail: detailSchema.partial().optional() }),
);

export async function getAdminServices() {
  await requireSession();
  await connectDB();
  const services = await Service.find().sort({ sortOrder: 1, name: 1 }).lean();
  return serializeDoc(services);
}

export async function getAdminService(id: string) {
  await requireSession();
  await connectDB();
  const service = await Service.findById(id).lean();
  if (!service) return null;
  return serializeDoc(service);
}

function sanitizeDetail(detail: z.infer<typeof detailSchema>) {
  return {
    ...detail,
    longIntroduction: sanitizeRichText(detail.longIntroduction ?? ""),
    sections: (detail.sections ?? []).map((s, i) => ({
      ...s,
      order: i,
      body: sanitizeRichText(s.body),
    })),
  };
}

export async function createService(
  input: z.infer<typeof serviceCreateSchema>,
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireSession();
    await connectDB();
    const parsed = serviceCreateSchema.safeParse(input);
    if (!parsed.success) {
      return actionError(
        parsed.error.issues[0]?.message ?? "Invalid service data",
      );
    }

    const data = parsed.data;
    const slug = await uniqueSlug(data.slug || data.name, async (s) =>
      Boolean(await Service.exists({ slug: s })),
    );

    const service = await Service.create({
      ...data,
      slug,
      detail: sanitizeDetail(
        data.detail ?? {
          longIntroduction: "",
          sections: [],
        },
      ),
      updatedBy: session.email,
    });

    if (service.status === "published") {
      revalidatePublicContent(["/services", `/services/${service.slug}`]);
    }
    revalidatePath("/admin/services");
    return actionSuccess({ id: String(service._id) }, "Service created");
  } catch {
    return actionError("Failed to create service");
  }
}

export async function updateService(
  id: string,
  input: z.infer<typeof serviceUpdateSchema>,
): Promise<ActionResult> {
  try {
    const session = await requireSession();
    await connectDB();
    const parsed = serviceUpdateSchema.safeParse(input);
    if (!parsed.success) {
      return actionError(
        parsed.error.issues[0]?.message ?? "Invalid service data",
      );
    }

    const patch: Record<string, unknown> = { updatedBy: session.email };
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value !== undefined) {
        if (key === "detail" && typeof value === "object") {
          patch.detail = sanitizeDetail(value as z.infer<typeof detailSchema>);
        } else {
          patch[key] = value;
        }
      }
    }

    const service = await Service.findByIdAndUpdate(
      id,
      { $set: patch },
      { new: true },
    );
    if (!service) return actionError("Service not found");

    revalidatePublicContent(["/services", `/services/${service.slug}`]);
    revalidatePath("/admin/services");
    revalidatePath(`/admin/services/${id}`);
    return actionSuccess(undefined, "Service saved");
  } catch {
    return actionError("Failed to update service");
  }
}

export async function archiveService(id: string): Promise<ActionResult> {
  try {
    const session = await requireSession();
    await connectDB();
    const service = await Service.findByIdAndUpdate(
      id,
      { $set: { status: "archived", updatedBy: session.email } },
      { new: true },
    );
    if (!service) return actionError("Service not found");

    revalidatePublicContent(["/services", `/services/${service.slug}`]);
    revalidatePath("/admin/services");
    return actionSuccess(undefined, "Service archived");
  } catch {
    return actionError("Failed to archive service");
  }
}

export async function suggestServiceSlug(name: string) {
  await requireSession();
  return makeSlug(name);
}
