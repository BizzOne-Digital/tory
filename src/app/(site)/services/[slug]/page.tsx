import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentBlocks } from "@/components/content/ContentBlocks";
import { ImageReveal } from "@/components/motion/image-reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { ServicesHero } from "@/components/services/ServicesHero";
import { SafeImage } from "@/components/ui/SafeImage";
import { Reveal } from "@/components/ui/Reveal";
import { getServiceBySlug, getPublishedServices } from "@/lib/queries/catalog";
import { safeQuery } from "@/lib/safe-query";
import type { ServiceData } from "@/types/cms";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const services = await safeQuery(
    () => getPublishedServices() as Promise<ServiceData[]>,
    [],
  );
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await safeQuery(
    () => getServiceBySlug(slug) as Promise<ServiceData | null>,
    null,
  );
  if (!service) return { title: "Service not found" };
  const seo = service.detail?.seo;
  return {
    title: seo?.title ?? service.name,
    description: seo?.description ?? service.shortDescription,
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const [service, allServices] = await Promise.all([
    safeQuery(
      () => getServiceBySlug(slug) as Promise<ServiceData | null>,
      null,
    ),
    safeQuery(() => getPublishedServices() as Promise<ServiceData[]>, []),
  ]);

  if (!service) notFound();

  const hero = service.detail?.hero as
    | (NonNullable<ServiceData["detail"]>["hero"] & {
        image?: ServiceData["mainImage"];
      })
    | undefined;
  const related = allServices
    .filter((s) => s.slug !== service.slug)
    .slice(0, 3);

  return (
    <>
      <ServicesHero
        eyebrow={hero?.eyebrow || "Service"}
        title={hero?.title || service.name}
        subtitle={
          hero?.subtitle ||
          service.shortDescription ||
          "A private atelier experience, shaped around you."
        }
        background={hero?.background ?? service.mainImage}
      />

      <section className="section-pad">
        <div className="container-wide grid items-start gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <p className="eyebrow text-gold">Overview</p>
            <TextReveal
              text={service.name}
              as="h2"
              className="mt-4 font-display text-3xl text-ink md:text-4xl"
            />
            {service.detail?.longIntroduction ? (
              <Reveal delay={0.1}>
                <p className="mt-6 text-base leading-relaxed text-muted md:text-lg">
                  {service.detail.longIntroduction}
                </p>
              </Reveal>
            ) : service.shortDescription ? (
              <Reveal delay={0.1}>
                <p className="mt-6 text-base leading-relaxed text-muted md:text-lg">
                  {service.shortDescription}
                </p>
              </Reveal>
            ) : null}
            <Reveal delay={0.15}>
              <Link
                href="/contact"
                className="btn-primary mt-8 inline-flex no-underline"
              >
                Book this service
              </Link>
            </Reveal>
          </div>

          <ImageReveal className="relative aspect-[4/5] w-full lg:col-span-7 lg:max-h-[520px]">
            <SafeImage
              src={hero?.image ?? service.mainImage}
              alt={service.name}
              fill
              sizes="(max-width:1024px) 100vw, 55vw"
            />
          </ImageReveal>
        </div>
      </section>

      {service.detail?.sections?.length ? (
        <section className="border-t border-border/70 bg-cream/30">
          <div className="container-wide section-pad">
            <ContentBlocks blocks={service.detail.sections} />
          </div>
        </section>
      ) : null}

      {related.length ? (
        <section className="section-pad">
          <div className="container-wide">
            <p className="eyebrow text-gold">Continue</p>
            <TextReveal
              text="Related services"
              as="h2"
              className="mt-3 font-display text-3xl text-ink md:text-4xl"
            />
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, i) => (
                <Reveal key={item._id} delay={i * 0.08}>
                  <Link
                    href={`/services/${item.slug}`}
                    className="group block no-underline"
                  >
                    <div className="relative aspect-[4/5] max-h-[280px] overflow-hidden">
                      <SafeImage
                        src={item.mainImage}
                        alt={item.name}
                        fill
                        sizes="33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="mt-4 font-display text-2xl text-ink">
                      {item.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted">
                      {item.shortDescription}
                    </p>
                  </Link>
                </Reveal>
              ))}
            </div>
            <div className="mt-12">
              <Link
                href="/services"
                className="link-underline text-[0.72rem] uppercase tracking-[0.22em] text-ink no-underline"
              >
                All services →
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-ink px-6 py-20 text-ivory md:py-24">
        <div className="container-wide flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="eyebrow text-gold">Next step</p>
            <h2 className="mt-4 font-display text-3xl md:text-4xl">
              Ready for a private fitting?
            </h2>
          </div>
          <Link href="/contact" className="btn-primary bg-gold text-ink no-underline hover:bg-gold-soft">
            Contact the atelier
          </Link>
        </div>
      </section>
    </>
  );
}
