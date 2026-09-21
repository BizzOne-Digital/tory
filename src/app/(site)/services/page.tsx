import type { Metadata } from "next";
import Link from "next/link";
import { Marquee } from "@/components/motion/marquee";
import { TextReveal } from "@/components/motion/text-reveal";
import { ServicesHero } from "@/components/services/ServicesHero";
import { ServiceShowcase } from "@/components/services/ServiceShowcase";
import { SafeImage } from "@/components/ui/SafeImage";
import { Reveal } from "@/components/ui/Reveal";
import { getPageBySlug } from "@/lib/queries/pages";
import { getPublishedServices } from "@/lib/queries/catalog";
import { safeQuery } from "@/lib/safe-query";
import type { PageData, ServiceData } from "@/types/cms";

export async function generateMetadata(): Promise<Metadata> {
  const page = await safeQuery(
    () => getPageBySlug("services") as Promise<PageData | null>,
    null,
  );
  return {
    title: page?.seo?.title ?? "Atelier Services",
    description:
      page?.seo?.description ??
      "Bespoke tailoring, alterations, wardrobe curation, and occasion dressing from LUCCI CRENO.",
  };
}

const PROCESS = [
  {
    num: "01",
    title: "Consultation",
    body: "We begin with your lifestyle, silhouette, and the story you want the garment to tell.",
  },
  {
    num: "02",
    title: "Fitting",
    body: "Private sessions in the atelier — precise measurements, fabric choices, and quiet refinement.",
  },
  {
    num: "03",
    title: "Creation",
    body: "Pattern, cut, and hand finishing. Every detail considered until the piece feels inevitable.",
  },
  {
    num: "04",
    title: "Delivery",
    body: "Your finished piece, ready to wear — with care guidance and lasting atelier support.",
  },
];

export default async function ServicesPage() {
  const [page, services] = await Promise.all([
    safeQuery(
      () => getPageBySlug("services") as Promise<PageData | null>,
      null,
    ),
    safeQuery(() => getPublishedServices() as Promise<ServiceData[]>, []),
  ]);

  const intro = page?.sections?.[0];
  const processSection = page?.sections?.find((s) => s.key === "process");
  const booking = page?.sections?.find((s) => s.key === "booking");

  return (
    <>
      <ServicesHero
        eyebrow={page?.hero?.eyebrow || "Atelier Services"}
        title={page?.hero?.title || "Tailored to You"}
        subtitle={
          page?.hero?.subtitle ||
          "Bespoke commissions, refinements, and wardrobe curation — shaped around how you live."
        }
        background={page?.hero?.background}
      />

      <Marquee
        items={[
          "Bespoke Tailoring",
          "Alterations",
          "Wardrobe Curation",
          "Bridal & Occasion",
          "Private Fittings",
        ]}
        speed={38}
      />

      {/* Intro */}
      <section className="section-pad">
        <div className="container-wide grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="eyebrow text-gold">The Offerings</p>
            <TextReveal
              text={intro?.title || "What we create with you"}
              as="h2"
              className="mt-4 font-display text-4xl text-ink md:text-5xl"
            />
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-muted md:text-lg">
                {intro?.body ||
                  page?.hero?.body ||
                  "From one-of-a-kind commissions to seasonal wardrobe refreshes — every service begins with a conversation."}
              </p>
            </Reveal>
          </div>
          <Reveal
            direction="right"
            className="relative aspect-[4/3] w-full overflow-hidden lg:col-span-6"
          >
            <SafeImage
              src={intro?.images?.[0] ?? page?.hero?.images?.[0] ?? page?.hero?.background}
              alt="Atelier service"
              fill
              sizes="50vw"
            />
          </Reveal>
        </div>
      </section>

      {/* Service list */}
      <section className="border-t border-border/70 bg-cream/30">
        <div className="container-wide py-14 md:py-16">
          <p className="eyebrow text-gold">Collection</p>
          <TextReveal
            text="Our services"
            as="h2"
            className="mt-3 font-display text-3xl text-ink md:text-4xl"
          />
        </div>
        <ServiceShowcase services={services} />
      </section>

      {/* Process */}
      <section className="section-pad bg-ink text-ivory">
        <div className="container-wide">
          <div className="max-w-2xl">
            <p className="eyebrow text-gold">The Process</p>
            <TextReveal
              text={processSection?.title || "How we work"}
              as="h2"
              className="mt-4 font-display text-4xl text-ivory md:text-5xl"
            />
            {processSection?.body ? (
              <p className="mt-5 text-ivory/65">{processSection.body}</p>
            ) : null}
          </div>

          <div className="mt-10 grid gap-0 border-t border-ivory/15 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((step, i) => (
              <Reveal
                key={step.num}
                delay={i * 0.07}
                className="border-b border-ivory/15 px-0 py-7 sm:border-r sm:px-5 sm:py-9 sm:odd:border-r lg:border-b-0 lg:px-7 lg:py-10 lg:last:border-r-0"
              >
                <p className="font-display text-3xl text-gold/90">{step.num}</p>
                <h3 className="mt-5 font-display text-2xl">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ivory/60">
                  {step.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative min-h-[60vh] overflow-hidden md:min-h-[65vh]">
        <SafeImage
          src={
            booking?.images?.[0] ??
            page?.hero?.background ??
            services[0]?.mainImage
          }
          alt="Book a fitting"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ink/55" />
        <div className="container-wide relative z-10 flex min-h-[60vh] flex-col items-start justify-center py-20 md:min-h-[65vh]">
          <Reveal>
            <p className="eyebrow text-gold-soft">By appointment</p>
            <h2 className="mt-4 max-w-2xl font-display text-4xl text-ivory md:text-5xl">
              {booking?.title || "Book your private fitting"}
            </h2>
            <p className="mt-5 max-w-lg text-base text-ivory/75 md:text-lg">
              {booking?.body ||
                "Tell us what you need — a commission, an alteration, or a wardrobe reset. We will prepare the atelier for you."}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href={booking?.ctaHref || "/contact"}
                className="btn-primary no-underline"
              >
                {booking?.ctaLabel || "Contact Us"}
              </Link>
              <Link
                href="/shop"
                className="btn-secondary border-ivory/50 text-ivory no-underline hover:bg-ivory hover:text-ink"
              >
                Shop the edit
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
