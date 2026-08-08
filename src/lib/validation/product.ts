import { z } from "zod";

const imageMetaSchema = z.object({
  url: z.string().trim().min(1),
  alt: z.string().default(""),
  caption: z.string().default(""),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  focalX: z.number().min(0).max(100).optional(),
  focalY: z.number().min(0).max(100).optional(),
});

const variantSchema = z.object({
  name: z.string().trim().min(1).max(100),
  options: z.array(z.string().trim().max(50)).default([]),
  sku: z.string().trim().max(50).default(""),
  priceOverrideMinor: z.number().int().min(0).optional(),
  inventory: z.number().int().min(0).default(0),
});

const seoSchema = z.object({
  title: z.string().default(""),
  description: z.string().default(""),
  ogImage: z.string().default(""),
  canonical: z.string().default(""),
});

const editorialSchema = z.object({
  title: z.string().default(""),
  body: z.string().default(""),
  images: z.array(imageMetaSchema).default([]),
});

const productFields = {
  name: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case"),
  sku: z.string().trim().min(1).max(50),
  shortDescription: z.string().default(""),
  description: z.string().default(""),
  priceMinor: z.number().int().min(0),
  compareAtPriceMinor: z.number().int().min(0).optional(),
  currency: z.string().trim().length(3).default("USD"),
  categories: z.array(z.string().trim().max(80)).default([]),
  collections: z.array(z.string().trim().max(80)).default([]),
  tags: z.array(z.string().trim().max(50)).default([]),
  images: z.array(imageMetaSchema).default([]),
  variants: z.array(variantSchema).default([]),
  materialCare: z.string().default(""),
  shippingReturns: z.string().default(""),
  featured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  seasonal: z.boolean().default(false),
  inventory: z.number().int().min(0).default(0),
  status: z.enum(["published", "draft", "archived"]).default("draft"),
  sortOrder: z.number().int().default(0),
  seo: seoSchema.default({
    title: "",
    description: "",
    ogImage: "",
    canonical: "",
  }),
  editorial: editorialSchema.default({
    title: "",
    body: "",
    images: [],
  }),
};

export const productCreateSchema = z.object(productFields);

export const productUpdateSchema = productCreateSchema.partial();

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
