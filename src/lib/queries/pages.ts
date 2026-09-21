import { unstable_cache } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import { Page } from "@/models";

export async function getPageBySlug(slug: string) {
  return unstable_cache(
    async () => {
      await connectDB();
      const page = await Page.findOne({ slug, status: "published" }).lean();
      return page ? JSON.parse(JSON.stringify(page)) : null;
    },
    [`page-${slug}`],
    { tags: ["cms", `page-${slug}`], revalidate: 60 },
  )();
}
