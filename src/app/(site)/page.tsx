import Link from "next/link";
import type { Metadata } from "next";
import { HomeHero } from "@/components/home/HomeHero";
import { ImageReveal } from "@/components/motion/image-reveal";
import { Marquee } from "@/components/motion/marquee";
import { SafeImage } from "@/components/ui/SafeImage";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TestimonialCarousel } from "@/components/testimonials/TestimonialCarousel";
import { getSettings } from "@/lib/queries/settings";
import { getPageBySlug } from "@/lib/queries/pages";
import {
  getPublishedServices,
  getTestimonials,
} from "@/lib/queries/catalog";
import { safeQuery } from "@/lib/safe-query";
import type {
  PageData,
  ServiceData,
  TestimonialData,
} from "@/types/cms";
import type { FooterSettings } from "@/components/site/Footer";

export async function generateMetadata(): Promise<Metadata> {
  const page = await safeQuery(
    () => getPageBySlug("home") as Promise<PageData | null>,
    null,
  );

  return {
    title: page?.seo?.title ?? "Welcome Home",
    description:
      page?.seo?.description ??
      "Genuine luxury you wear from the LUCCI CRENO atelier.",
  };
}

export default async function HomePage() {
  const [page, settings, services, testimonials] = await Promise.all([
      safeQuery(() => getPageBySlug("home") as Promise<PageData | null>, null),
      safeQuery(() => getSettings() as Promise<FooterSettings>, {}),
      safeQuery(
        () => getPublishedServices() as Promise<ServiceData[]>,
        [],
      ),
      safeQuery(
        () => getTestimonials(true) as Promise<TestimonialData[]>,
        [],
      ),
    ]);

  const hero = page?.hero;
  const intro = page?.sections?.find((s) => s.key === "intro");
  const featuredServices = services.filter((s) => s.featured).slice(0, 3);
  const serviceCards = featuredServices.length
    ? featuredServices
    : services.slice(0, 3);
  const editorialImage = hero?.images?.[0] ?? intro?.images?.[0];
  const editorialSecondary = hero?.images?.[1] ?? intro?.images?.[0];

  return (
    <>
      <HomeHero
        title={hero?.title ?? "Create Genuine Luxury You Wear"}
        subtitle={
          hero?.subtitle ??
          "Bespoke tailoring and curated couture edits for enduring elegance."
        }
        ctaLabel={hero?.ctaLabel ?? "Explore the Collection"}
        ctaHref={hero?.ctaHref ?? "/shop"}
        secondaryCtaLabel={hero?.secondaryCtaLabel ?? "Discover the Story"}
        secondaryCtaHref={hero?.secondaryCtaHref ?? "/about"}
        background={hero?.background}
      />

      <Marquee
        items={[
          "Genuine Luxury",
          "Welcome Home",
          "Timeless Wear",
          "Atelier Craft",
          "Forever Pieces",
          "LUCCI CRENO",
        ]}
      />

      <section className="section-pad">
        <div className="container-wide grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <Reveal direction="left">
            <SectionHeading
              eyebrow={intro?.eyebrow ?? "Manifesto"}
              title={intro?.title ?? "Wearable Artistry"}
              body={
                intro?.body ??
                page?.hero?.body ??
                "Every piece begins with intention — silhouette, drape, and the quiet drama of impeccable construction."
              }
            />
          </Reveal>
          <ImageReveal
            direction="right"
            delay={0.1}
            className="relative aspect-[4/5] lg:mt-16"
          >
            <SafeImage
              src={intro?.images?.[0] ?? hero?.images?.[0]}
              alt="Atelier craftsmanship"
              fill
              sizes="(max-width:1024px) 100vw, 45vw"
            />
          </ImageReveal>
        </div>
      </section>

      <section className="section-pad overflow-hidden">
        <div className="container-wide grid gap-8 lg:grid-cols-12 lg:gap-6">
          <ImageReveal
            direction="left"
            className="relative aspect-[3/4] lg:col-span-5 lg:mt-24"
          >
            <SafeImage
              src={editorialImage}
              alt="Editorial portrait"
              fill
              sizes="(max-width:1024px) 100vw, 40vw"
            />
          </ImageReveal>
          <div className="lg:col-span-7 lg:py-12">
            <Reveal direction="right">
              <SectionHeading
                eyebrow="Editorial"
                title="Summer Light, Tailored Ease"
                body="An asymmetrical study in ivory, sand, and coral — pieces that move from gallery openings to seaside evenings without changing character."
              />
            </Reveal>
            <ImageReveal
              direction="up"
              delay={0.12}
              className="relative mt-10 aspect-[16/10]"
            >
              <SafeImage
                src={editorialSecondary}
                alt="Editorial still life"
                fill
                sizes="(max-width:1024px) 100vw, 55vw"
              />
            </ImageReveal>
          </div>
        </div>
      </section>

      <section className="section-pad border-y border-border/70">
        <div className="container-wide">
          <SectionHeading
            eyebrow="Atelier"
            title="Featured Services"
            body="From bespoke tailoring to wardrobe curation."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {serviceCards.map((service, i) => (
              <Reveal
                key={service._id}
                delay={i * 0.1}
                direction={i % 2 === 0 ? "up" : "right"}
              >
                <Link
                  href={`/services/${service.slug}`}
                  className="group block no-underline"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <SafeImage
                      src={service.mainImage}
                      alt={service.name}
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/20" />
                  </div>
                  <h3 className="mt-5 font-display text-2xl text-ink transition-transform duration-500 group-hover:translate-x-1">
                    {service.name}
                  </h3>
                  <p className="mt-2 text-sm text-muted">
                    {service.shortDescription}
                  </p>
                  <span className="mt-3 inline-block text-[0.68rem] uppercase tracking-[0.22em] text-gold opacity-0 transition-all duration-500 group-hover:opacity-100">
                    Explore →
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {settings.seasonalOffer?.active && settings.seasonalOffer.text ? (
        <Reveal>
          <section className="relative overflow-hidden bg-gradient-to-r from-ink via-ink-soft to-ink px-6 py-20 text-ivory">
            <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-gold/15 blur-3xl sm:h-64 sm:w-64" />
            <div className="container-wide relative grid items-center gap-6 sm:gap-8 lg:grid-cols-[1fr_auto]">
              <div className="min-w-0">
                <p className="eyebrow text-gold-soft">Seasonal Offer</p>
                <p className="mt-4 break-words font-display text-2xl sm:text-3xl md:text-5xl">
                  {settings.seasonalOffer.text}
                </p>
              </div>
              {settings.seasonalOffer.ctaHref &&
              settings.seasonalOffer.ctaLabel ? (
                <Link
                  href={settings.seasonalOffer.ctaHref}
                  className="btn-primary w-full bg-gold text-ink no-underline hover:bg-gold-soft sm:w-auto"
                >
                  {settings.seasonalOffer.ctaLabel}
                </Link>
              ) : null}
            </div>
          </section>
        </Reveal>
      ) : null}

      <TestimonialCarousel
        testimonials={testimonials}
        eyebrow="Client Stories"
        title="What Clients Say"
      />

      <section className="section-pad">
        <Reveal>
          <div className="container-wide grid items-center gap-10 overflow-hidden border border-border bg-cream/60 p-8 md:grid-cols-2 md:p-12">
            <SectionHeading
              eyebrow="Newsletter"
              title="Enter the Circle"
              body={
                settings.newsletterCta ??
                "Private previews, atelier notes, and invitation-only edits."
              }
              className="mb-0"
            />
            <ImageReveal direction="scale" className="relative aspect-[4/3]">
              <SafeImage
                src={hero?.images?.[1] ?? editorialImage}
                alt="Newsletter editorial"
                fill
                sizes="(max-width:768px) 100vw, 40vw"
              />
            </ImageReveal>
          </div>
        </Reveal>
      </section>
    </>
  );
}
