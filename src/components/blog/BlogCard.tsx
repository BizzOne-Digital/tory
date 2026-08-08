import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { Reveal } from "@/components/ui/Reveal";
import { formatDate } from "@/lib/utils";
import type { BlogPostData } from "@/types/cms";

export function BlogCard({ post }: { post: BlogPostData }) {
  return (
    <Reveal>
      <Link href={`/blog/${post.slug}`} className="group block no-underline">
        <div className="relative aspect-[16/11] overflow-hidden bg-sand/30">
          <SafeImage
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width:768px) 100vw, 33vw"
            className="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/15" />
        </div>
        <div className="mt-5">
          <p className="eyebrow text-gold">
            {post.category ?? "Journal"} · {post.publishDate ? formatDate(post.publishDate) : ""}
          </p>
          <h3 className="mt-2 font-display text-2xl text-ink transition-transform duration-500 group-hover:translate-x-1">
            {post.title}
          </h3>
          {post.excerpt ? (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
              {post.excerpt}
            </p>
          ) : null}
        </div>
      </Link>
    </Reveal>
  );
}
