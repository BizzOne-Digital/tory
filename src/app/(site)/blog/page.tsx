import type { Metadata } from "next";
import { PageHeroBlock } from "@/components/content/PageHero";
import { BlogCard } from "@/components/blog/BlogCard";
import { getPageBySlug } from "@/lib/queries/pages";
import { getBlogPosts } from "@/lib/queries/catalog";
import { safeQuery } from "@/lib/safe-query";
import type { BlogPostData, PageData } from "@/types/cms";

export async function generateMetadata(): Promise<Metadata> {
  const page = await safeQuery(
    () => getPageBySlug("blog") as Promise<PageData | null>,
    null,
  );
  return {
    title: page?.seo?.title ?? "Journal",
    description: page?.seo?.description ?? page?.hero?.subtitle,
  };
}

export default async function BlogPage() {
  const [page, posts] = await Promise.all([
    safeQuery(() => getPageBySlug("blog") as Promise<PageData | null>, null),
    safeQuery(() => getBlogPosts() as Promise<BlogPostData[]>, []),
  ]);

  return (
    <>
      <PageHeroBlock hero={page?.hero} fallbackTitle="Atelier Notes" />
      <div className="container-wide section-pad">
        {posts.length ? (
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted">Journal entries coming soon.</p>
        )}
      </div>
    </>
  );
}
