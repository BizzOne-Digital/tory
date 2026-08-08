import type { Metadata } from "next";
import Link from "next/link";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutStory } from "@/components/about/AboutStory";
import { ImageReveal } from "@/components/motion/image-reveal";
import { Marquee } from "@/components/motion/marquee";
import { TextReveal } from "@/components/motion/text-reveal";
import { SafeImage } from "@/components/ui/SafeImage";
import { Reveal } from "@/components/ui/Reveal";
import { getPageBySlug } from "@/lib/queries/pages";
import { safeQuery } from "@/lib/safe-query";
import type { PageData } from "@/types/cms";

export async function generateMetadata(): Promise<Metadata> {
  const page = await safeQuery(
    () => getPageBySlug("about") as Promise<PageData | null>,
    null,
  );
  return {
    title: page?.seo?.title ?? "Our Story",
    description:
      page?.seo?.description ??
      "The LUCCI CRENO atelier — genuine luxury, heritage craft, contemporary vision.",
  };
}

const TIMELINE = [
  {
    year: "2014",
    title: "The first atelier",
    body: "A quiet studio. One cutter. A devotion to fit that feels personal.",
  },
  {
    year: "2018",
    title: "Bespoke circle",
    body: "Private fittings become the heart of the house — invitations, not appointments.",
  },
  {
    year: "2022",
    title: "Summer edit",
    body: "Ready-to-wear arrives: sun-washed ivory, coral light, enduring ease.",
  },
  {
    year: "Today",
    title: "Forever pieces",
    body: "A living atelier for those who prefer elegance that lasts.",
  },
];

const VALUES = [
  {
    num: "01",
    title: "Enduring over fleeting",
    body: "We design against the season’s noise — for wardrobes that deepen with years.",
  },
  {
    num: "02",
    title: "Material honesty",
    body: "Cloth chosen for touch, breath, and how it moves when you live in it.",
  },
  {
    num: "03",
    title: "Invisible craft",
    body: "The finest details are felt, not announced — seams that disappear into ease.",
  },
  {
    num: "04",
    title: "Intimate service",
    body: "Fittings, edits, and counsel offered with the privacy of a private salon.",
  },
];

export default async function AboutPage() {
  const page = await safeQuery(
    () => getPageBySlug("about") as Promise<PageData | null>,
    null,
  );

  const philosophy = page?.sections?.find((s) => s.key === "philosophy");
  const craft = page?.sections?.find((s) => s.key === "craft");
  const team = page?.sections?.find((s) => s.key === "team");

  const img = {
    a: philosophy?.images?.[0] ?? page?.hero?.images?.[0],
    b: craft?.images?.[0] ?? page?.hero?.background,
    c: craft?.images?.[1] ?? page?.hero?.background,
    d: team?.images?.[0] ?? page?.hero?.images?.[0],
    e: team?.images?.[1] ?? craft?.images?.[0],
  };

  return (
    <>
      <AboutHero
        eyebrow={page?.hero?.eyebrow || "Our Story"}
        title={page?.hero?.title || "The Atelier"}
        subtitle={
          page?.hero?.subtitle ||
          "Heritage craft, contemporary vision — luxury made to be worn, not locked away."
        }
        background={page?.hero?.background}
        sideImage={page?.hero?.images?.[0] ?? philosophy?.images?.[0]}
      />

      <Marquee
        items={[
          "Genuine Luxury",
          "Welcome Home",
          "Something Forever",
          "Atelier Craft",
          "LUCCI CRENO",
        ]}
        speed={36}
      />

      <AboutStory
        philosophyTitle={philosophy?.title ?? "A house of quiet intention"}
        philosophyBody={
          philosophy?.body ??
          "Founded on the belief that luxury should be lived in — not locked away. We create garments that honour the body and elevate everyday moments into quiet ceremony."
        }
        craftTitle={craft?.title ?? "Craft & Materials"}
        craftBody={
          craft?.body ??
          "Italian silks, Japanese wools, and heritage techniques passed through generations of makers — finished by hand, worn with ease."
        }
        imageA={img.a}
        imageB={img.b}
        imageC={img.c}
        imageD={img.d}
        imageE={img.e}
      />

      {/* Values — editorial numbers, no cards */}
      <section className="section-pad">
        <div className="container-wide">
          <div className="max-w-2xl">
            <p className="eyebrow text-gold">Values</p>
            <TextReveal
              text="What we stand for"
              as="h2"
              className="mt-4 font-display text-4xl text-ink md:text-5xl"
            />
          </div>

          <div className="mt-14 divide-y divide-border/80 border-y border-border/80">
            {VALUES.map((value, i) => (
              <Reveal key={value.num} delay={i * 0.06}>
                <div className="grid gap-4 py-8 md:grid-cols-[100px_1fr_1.4fr] md:items-baseline md:gap-10 md:py-10">
                  <span className="font-display text-2xl text-gold/80">
                    {value.num}
                  </span>
                  <h3 className="font-display text-2xl text-ink md:text-3xl">
                    {value.title}
                  </h3>
                  <p className="text-base leading-relaxed text-muted">
                    {value.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline chapters */}
      <section className="overflow-hidden bg-ink py-20 text-ivory md:py-28">
        <div className="container-wide mb-12 md:mb-16">
          <p className="eyebrow text-gold">Chapters</p>
          <TextReveal
            text="Our journey"
            as="h2"
            className="mt-4 font-display text-4xl text-ivory md:text-5xl"
          />
        </div>

        <div className="no-scrollbar flex gap-4 overflow-x-auto px-4 pb-4 sm:gap-5 sm:px-6 md:px-[max(1.5rem,calc((100%-1440px)/2+1.5rem))]">
          {TIMELINE.map((item, i) => (
            <Reveal
              key={item.year}
              delay={i * 0.08}
              className="w-[min(260px,78vw)] shrink-0 border border-ivory/15 bg-white/[0.03] p-6 sm:w-[280px] sm:p-7 md:w-[320px]"
            >
              <p className="font-display text-4xl text-gold">{item.year}</p>
              <h3 className="mt-6 font-display text-2xl">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ivory/65">
                {item.body}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Atelier makers */}
      <section className="section-pad">
        <div className="container-wide grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4 lg:pt-2">
            <p className="eyebrow text-gold">Atelier</p>
            <TextReveal
              text={team?.title ?? "The makers"}
              as="h2"
              className="mt-3 font-display text-3xl text-ink md:text-4xl"
            />
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-sm text-base leading-relaxed text-muted">
                {team?.body ??
                  "A small team of master tailors, pattern cutters, and stylists united by precision — and by the belief that clothing should feel like home."}
              </p>
              <Link
                href="/services"
                className="link-underline mt-6 inline-flex text-[0.72rem] uppercase tracking-[0.22em] text-ink no-underline"
              >
                Explore services
              </Link>
            </Reveal>
          </div>

          <div className="grid h-auto grid-cols-2 gap-2.5 sm:gap-3 lg:col-span-8 lg:h-[320px] lg:grid-cols-[1.4fr_1fr]">
            <ImageReveal className="relative col-span-2 h-[220px] w-full sm:h-[260px] lg:col-span-1 lg:row-span-2 lg:h-full">
              <SafeImage
                src={img.d ?? img.a}
                alt="Lead tailor"
                fill
                sizes="(max-width:1024px) 100vw, 35vw"
              />
            </ImageReveal>
            <ImageReveal
              delay={0.08}
              direction="up"
              className="relative h-[160px] w-full sm:h-[180px] lg:h-full"
            >
              <SafeImage
                src={img.e ?? img.b}
                alt="Head stylist"
                fill
                sizes="20vw"
              />
            </ImageReveal>
            <ImageReveal
              delay={0.12}
              direction="right"
              className="relative h-[160px] w-full sm:h-[180px] lg:h-full"
            >
              <SafeImage
                src={img.c ?? img.a}
                alt="Studio light"
                fill
                sizes="20vw"
              />
            </ImageReveal>
          </div>
        </div>
      </section>

      {/* Closing cinematic CTA */}
      <section className="relative min-h-[70vh] overflow-hidden">
        <SafeImage
          src={page?.hero?.background ?? img.b}
          alt="Visit the atelier"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ink/55" />
        <div className="container-wide relative z-10 flex min-h-[70vh] flex-col items-start justify-end pb-16 pt-32 md:pb-24">
          <Reveal>
            <p className="eyebrow text-gold-soft">Welcome Home</p>
            <h2 className="mt-4 max-w-2xl font-display text-4xl text-ivory md:text-6xl">
              Something that feels forever
            </h2>
            <p className="mt-5 max-w-lg text-base text-ivory/75 md:text-lg">
              Step into the atelier for a private fitting, a wardrobe edit, or
              simply to begin your story with LUCCI CRENO.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/contact" className="btn-primary no-underline">
                Book a fitting
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
