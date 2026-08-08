import { z } from "zod";

export const imageMetaSchema = z.object({
  url: z.string().trim().min(1),
  alt: z.string().default(""),
  caption: z.string().default(""),
  width: z.number().int().positive().nullish(),
  height: z.number().int().positive().nullish(),
  focalX: z.number().min(0).max(100).nullish(),
  focalY: z.number().min(0).max(100).nullish(),
});

export const seoSchema = z.object({
  title: z.string().default(""),
  description: z.string().default(""),
  ogImage: z.string().default(""),
  canonical: z.string().default(""),
});

export const contentBlockSchema = z.object({
  _id: z.string().optional(),
  type: z.enum([
    "text",
    "heading",
    "quote",
    "image",
    "gallery",
    "cta",
    "split",
    "html",
  ]),
  eyebrow: z.string().default(""),
  heading: z.string().default(""),
  body: z.string().default(""),
  alignment: z
    .enum(["left", "right", "center", "split-left", "split-right"])
    .default("left"),
  ctaLabel: z.string().default(""),
  ctaHref: z.string().default(""),
  images: z.array(imageMetaSchema).default([]),
  enabled: z.boolean().default(true),
  order: z.number().int().default(0),
});

export const pageHeroSchema = z.object({
  eyebrow: z.string().default(""),
  title: z.string().default(""),
  subtitle: z.string().default(""),
  body: z.string().default(""),
  ctaLabel: z.string().default(""),
  ctaHref: z.string().default(""),
  secondaryCtaLabel: z.string().default(""),
  secondaryCtaHref: z.string().default(""),
  background: imageMetaSchema.optional(),
  images: z.array(imageMetaSchema).default([]),
});

export const pageSectionSchema = z.object({
  _id: z.string().optional(),
  key: z.string().trim().min(1),
  type: z.string().trim().min(1),
  title: z.string().default(""),
  eyebrow: z.string().default(""),
  body: z.string().default(""),
  ctaLabel: z.string().default(""),
  ctaHref: z.string().default(""),
  secondaryCtaLabel: z.string().default(""),
  secondaryCtaHref: z.string().default(""),
  images: z.array(imageMetaSchema).default([]),
  enabled: z.boolean().default(true),
  order: z.number().int().default(0),
  meta: z.record(z.string(), z.unknown()).default({}),
});

export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case");
