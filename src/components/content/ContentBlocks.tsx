import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { Reveal } from "@/components/ui/Reveal";
import { sanitizeRichText } from "@/lib/sanitize-html";
import { cn } from "@/lib/utils";
import type { ContentBlock } from "@/types/cms";

type ContentBlocksProps = {
  blocks?: ContentBlock[];
  className?: string;
};

export function ContentBlocks({ blocks = [], className }: ContentBlocksProps) {
  const sorted = [...blocks]
    .filter((b) => b.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (!sorted.length) return null;

  return (
    <div className={cn("space-y-16", className)}>
      {sorted.map((block, index) => (
        <BlockRenderer key={block._id ?? index} block={block} />
      ))}
    </div>
  );
}

function BlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "heading":
      return (
        <Reveal>
          {block.eyebrow ? <p className="eyebrow mb-3">{block.eyebrow}</p> : null}
          <h2 className="font-display text-3xl md:text-4xl">{block.heading}</h2>
        </Reveal>
      );
    case "quote":
      return (
        <Reveal className="border-l-2 border-gold pl-6 md:pl-10">
          <blockquote className="font-display text-2xl leading-snug text-ink md:text-3xl">
            {block.body}
          </blockquote>
        </Reveal>
      );
    case "image":
      return (
        <Reveal className="relative aspect-[4/5] overflow-hidden md:aspect-[16/10]">
          <SafeImage src={block.images?.[0]} alt={block.heading} fill sizes="(max-width:768px) 100vw, 80vw" />
        </Reveal>
      );
    case "gallery":
      return (
        <div className="grid gap-4 md:grid-cols-3">
          {block.images?.map((image, i) => (
            <Reveal key={i} delay={i * 0.08} className="relative aspect-[3/4] overflow-hidden">
              <SafeImage src={image} alt={image.alt} fill sizes="33vw" />
            </Reveal>
          ))}
        </div>
      );
    case "split":
      return (
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            {block.eyebrow ? <p className="eyebrow mb-3">{block.eyebrow}</p> : null}
            <h2 className="font-display text-3xl">{block.heading}</h2>
            {block.body ? (
              <div
                className="prose-luxe mt-4 text-muted"
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(block.body) }}
              />
            ) : null}
          </Reveal>
          <Reveal delay={0.1} className="relative aspect-[4/5] overflow-hidden">
            <SafeImage src={block.images?.[0]} alt={block.heading} fill sizes="50vw" />
          </Reveal>
        </div>
      );
    case "cta":
      return (
        <Reveal className="bg-ink px-8 py-12 text-center text-ivory md:px-16">
          {block.heading ? (
            <h2 className="font-display text-3xl">{block.heading}</h2>
          ) : null}
          {block.body ? <p className="mx-auto mt-4 max-w-xl text-ivory/80">{block.body}</p> : null}
          {block.ctaLabel && block.ctaHref ? (
            <Link href={block.ctaHref} className="btn-primary mt-8 inline-flex no-underline">
              {block.ctaLabel}
            </Link>
          ) : null}
        </Reveal>
      );
    case "html":
      return (
        <Reveal>
          <div
            className="prose-luxe text-muted"
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(block.body ?? "") }}
          />
        </Reveal>
      );
    case "text":
    default:
      return (
        <Reveal className="max-w-3xl">
          {block.eyebrow ? <p className="eyebrow mb-3">{block.eyebrow}</p> : null}
          {block.heading ? (
            <h2 className="font-display text-3xl">{block.heading}</h2>
          ) : null}
          {block.body ? (
            <div
              className="mt-4 leading-relaxed text-muted"
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(block.body) }}
            />
          ) : null}
        </Reveal>
      );
  }
}
