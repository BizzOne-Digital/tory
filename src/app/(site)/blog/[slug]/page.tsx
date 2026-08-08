import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentBlocks } from "@/components/content/ContentBlocks";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { BlogCard } from "@/components/blog/BlogCard";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { SafeImage } from "@/components/ui/SafeImage";
import { Reveal } from "@/components/ui/Reveal";
import { getBlogBySlug, getBlogPosts } from "@/lib/queries/catalog";
import { safeQuery } from "@/lib/safe-query";
import { formatDate } from "@/lib/utils";
import type { BlogPostData } from "@/types/cms";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await safeQuery(
    () => getBlogBySlug(slug) as Promise<BlogPostData | null>,
    null,
  );
  if (!post) return { title: "Article not found" };
  return {
    title: post.seo?.title ?? post.title,
    description: post.seo?.description ?? post.excerpt,
    openGraph: {
      images: post.coverImage?.url ? [post.coverImage.url] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([
    safeQuery(() => getBlogBySlug(slug) as Promise<BlogPostData | null>, null),
    safeQuery(() => getBlogPosts() as Promise<BlogPostData[]>, []),
  ]);

  if (!post) notFound();

  const related = allPosts.filter((p) => p._id !== post._id).slice(0, 3);
  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/blog/${post.slug}`;

  return (
    <>
      <ReadingProgress />
      <article>
        <header className="relative min-h-[55vh] overflow-hidden">
          <SafeImage
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />
          <div className="container-wide relative flex min-h-[55vh] items-end pb-12 pt-28">
            <Reveal className="max-w-3xl text-ivory">
              <p className="eyebrow text-gold-soft">
                {post.category ?? "Journal"} ·{" "}
                {post.publishDate ? formatDate(post.publishDate) : ""} ·{" "}
                {post.readingMinutes ?? 4} min read
              </p>
              <h1 className="mt-4 font-display text-[clamp(2.25rem,5vw,4rem)] leading-tight">
                {post.title}
              </h1>
              {post.excerpt ? (
                <p className="mt-4 text-lg text-ivory/85">{post.excerpt}</p>
              ) : null}
            </Reveal>
          </div>
        </header>

        <div className="container-wide section-pad max-w-3xl">
          <ContentBlocks blocks={post.blocks} />
          <Reveal className="mt-12 border-t border-border pt-8">
            <p className="eyebrow">Share</p>
            <ShareButtons url={shareUrl} title={post.title} />
          </Reveal>
        </div>
      </article>

      {related.length ? (
        <section className="border-t border-border/70 bg-sand/15">
          <div className="container-wide section-pad">
            <h2 className="font-display text-3xl">Related reading</h2>
            <div className="mt-10 grid gap-10 md:grid-cols-3">
              {related.map((item) => (
                <BlogCard key={item._id} post={item} />
              ))}
            </div>
            <Link href="/blog" className="btn-secondary mt-10 inline-flex no-underline">
              Back to journal
            </Link>
          </div>
        </section>
      ) : null}
    </>
  );
}
