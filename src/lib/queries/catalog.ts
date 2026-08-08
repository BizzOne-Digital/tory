import { unstable_cache } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import {
  BlogPost,
  Faq,
  FaqCategory,
  GalleryCategory,
  GalleryImage,
  Product,
  Service,
  Testimonial,
} from "@/models";

function lean(data: unknown) {
  return JSON.parse(JSON.stringify(data));
}

export async function getPublishedProducts(limit?: number) {
  return unstable_cache(
    async () => {
      await connectDB();
      const q = Product.find({ status: "published" }).sort({
        sortOrder: 1,
        createdAt: -1,
      });
      if (limit) q.limit(limit);
      return lean(await q.lean());
    },
    [`products-${limit ?? "all"}`],
    { tags: ["cms", "products"], revalidate: 60 },
  )();
}

export async function getProductBySlug(slug: string) {
  return unstable_cache(
    async () => {
      await connectDB();
      return lean(
        await Product.findOne({ slug, status: "published" }).lean(),
      );
    },
    [`product-${slug}`],
    { tags: ["cms", "products", `product-${slug}`], revalidate: 60 },
  )();
}

export async function getPublishedServices() {
  return unstable_cache(
    async () => {
      await connectDB();
      return lean(
        await Service.find({ status: "published" })
          .sort({ sortOrder: 1, createdAt: -1 })
          .lean(),
      );
    },
    ["services-all"],
    { tags: ["cms", "services"], revalidate: 60 },
  )();
}

export async function getServiceBySlug(slug: string) {
  return unstable_cache(
    async () => {
      await connectDB();
      return lean(
        await Service.findOne({ slug, status: "published" }).lean(),
      );
    },
    [`service-${slug}`],
    { tags: ["cms", "services", `service-${slug}`], revalidate: 60 },
  )();
}

export async function getGalleryData() {
  return unstable_cache(
    async () => {
      await connectDB();
      const categories = await GalleryCategory.find({ status: "published" })
        .sort({ sortOrder: 1 })
        .lean();
      const images = await GalleryImage.find({ status: "published" })
        .sort({ sortOrder: 1 })
        .lean();
      return lean({ categories, images });
    },
    ["gallery"],
    { tags: ["cms", "gallery"], revalidate: 60 },
  )();
}

export async function getTestimonials(featuredOnly = false) {
  return unstable_cache(
    async () => {
      await connectDB();
      const filter: Record<string, unknown> = { status: "published" };
      if (featuredOnly) filter.featured = true;
      return lean(
        await Testimonial.find(filter).sort({ sortOrder: 1 }).lean(),
      );
    },
    [`testimonials-${featuredOnly ? "featured" : "all"}`],
    { tags: ["cms", "testimonials"], revalidate: 60 },
  )();
}

export async function getFaqs() {
  return unstable_cache(
    async () => {
      await connectDB();
      const categories = await FaqCategory.find({ status: "published" })
        .sort({ sortOrder: 1 })
        .lean();
      const faqs = await Faq.find({ status: "published" })
        .sort({ sortOrder: 1 })
        .lean();
      return lean({ categories, faqs });
    },
    ["faqs"],
    { tags: ["cms", "faqs"], revalidate: 60 },
  )();
}

export async function getBlogPosts(limit?: number) {
  return unstable_cache(
    async () => {
      await connectDB();
      const q = BlogPost.find({ status: "published" }).sort({
        publishDate: -1,
      });
      if (limit) q.limit(limit);
      return lean(await q.lean());
    },
    [`blog-${limit ?? "all"}`],
    { tags: ["cms", "blog"], revalidate: 60 },
  )();
}

export async function getBlogBySlug(slug: string) {
  return unstable_cache(
    async () => {
      await connectDB();
      return lean(
        await BlogPost.findOne({ slug, status: "published" }).lean(),
      );
    },
    [`blog-${slug}`],
    { tags: ["cms", "blog", `blog-${slug}`], revalidate: 60 },
  )();
}
