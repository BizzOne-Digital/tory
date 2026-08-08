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
import { imageMetaSchema, seoSchema } from "@/lib/validation/admin-shared";
import { SiteSettings } from "@/models";

const footerLinkSchema = z.object({
  label: z.string().trim().min(1),
  href: z.string().trim().min(1),
});

const footerGroupSchema = z.object({
  title: z.string().trim().min(1),
  links: z.array(footerLinkSchema).default([]),
});

const settingsSchema = z.object({
  brandName: z.string().default(""),
  shortStatement: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  socialHandle: z.string().default(""),
  socialLinks: z
    .object({
      instagram: z.string().default(""),
      facebook: z.string().default(""),
      pinterest: z.string().default(""),
      twitter: z.string().default(""),
    })
    .optional(),
  address: z.string().default(""),
  locationEnabled: z.boolean().default(true),
  businessHours: z.string().default(""),
  footerDescription: z.string().default(""),
  footerNavGroups: z.array(footerGroupSchema).default([]),
  currency: z.string().length(3).default("USD"),
  seasonalOffer: z
    .object({
      active: z.boolean().default(false),
      text: z.string().default(""),
      discountPercent: z.number().min(0).max(100).default(0),
      ctaLabel: z.string().default(""),
      ctaHref: z.string().default(""),
    })
    .optional(),
  newsletterCta: z.string().default(""),
  defaultSeo: seoSchema.optional(),
  logoDisplay: z
    .object({
      showWordmark: z.boolean().default(true),
      showMonogram: z.boolean().default(true),
    })
    .optional(),
  contactHeroImage: imageMetaSchema.optional(),
});

export async function getSiteSettingsAdmin() {
  await requireSession();
  await connectDB();
  const settings =
    (await SiteSettings.findOne({ key: "default" }).lean()) ??
    (await SiteSettings.create({ key: "default" }).then((d) => d.toObject()));
  return serializeDoc(settings);
}

export async function saveSiteSettings(
  input: z.infer<typeof settingsSchema>,
): Promise<ActionResult> {
  try {
    await requireSession();
    await connectDB();
    const parsed = settingsSchema.safeParse(input);
    if (!parsed.success) {
      return actionError(
        parsed.error.issues[0]?.message ?? "Invalid settings data",
      );
    }

    await SiteSettings.findOneAndUpdate(
      { key: "default" },
      { $set: parsed.data },
      { upsert: true, new: true },
    );

    revalidatePublicContent();
    revalidateTag("settings", "max");
    revalidateTag("cms", "max");
    revalidatePath("/admin/settings");
    return actionSuccess(undefined, "Settings saved");
  } catch {
    return actionError("Failed to save settings");
  }
}
