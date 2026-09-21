import { PageHeroBlock } from "@/components/content/PageHero";
import { ContentBlocks } from "@/components/content/ContentBlocks";
import { Reveal } from "@/components/ui/Reveal";
import { sanitizeRichText } from "@/lib/sanitize-html";
import type { PageData } from "@/types/cms";

export function PolicyPageContent({ page }: { page: PageData | null }) {
  if (!page) {
    return (
      <div className="container-luxe section-pad text-center">
        <p className="font-display text-3xl">Content unavailable</p>
        <p className="mt-3 text-muted">
          This page will be published soon. Please contact the atelier for assistance.
        </p>
      </div>
    );
  }

  const legalSection = page.sections?.find((s) => s.type === "legal");

  return (
    <>
      <PageHeroBlock hero={page.hero} fallbackTitle={page.title} size="compact" />
      <div className="container-luxe section-pad max-w-3xl">
        {legalSection?.body ? (
          <Reveal>
            <div
              className="prose-luxe leading-relaxed text-muted"
              dangerouslySetInnerHTML={{
                __html: sanitizeRichText(legalSection.body),
              }}
            />
          </Reveal>
        ) : null}
        <ContentBlocks blocks={page.blocks} className="mt-12" />
      </div>
    </>
  );
}
