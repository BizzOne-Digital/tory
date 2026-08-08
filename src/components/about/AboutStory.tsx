"use client";

import { SafeImage } from "@/components/ui/SafeImage";
import { TextReveal } from "@/components/motion/text-reveal";
import { Reveal } from "@/components/ui/Reveal";
import { ImageReveal } from "@/components/motion/image-reveal";

type Img = { url?: string; alt?: string } | string | null | undefined;

type AboutStoryProps = {
  philosophyTitle: string;
  philosophyBody: string;
  craftTitle: string;
  craftBody: string;
  imageA?: Img;
  imageB?: Img;
  imageC?: Img;
  imageD?: Img;
  imageE?: Img;
};

export function AboutStory({
  philosophyTitle,
  philosophyBody,
  craftTitle,
  craftBody,
  imageA,
  imageB,
  imageC,
  imageD,
  imageE,
}: AboutStoryProps) {
  return (
    <>
      {/* Manifesto band */}
      <section className="relative overflow-hidden bg-cream py-20 md:py-28">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-4xl text-center">
            <p className="eyebrow text-gold">Manifesto</p>
            <p className="mt-8 font-display text-[clamp(1.75rem,4vw,3.25rem)] leading-[1.15] text-ink">
              Create genuine luxury you wear — pieces that feel forever,
              shaped by light, craft, and the quiet confidence of true elegance.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Origin — asymmetric editorial */}
      <section className="section-pad overflow-hidden">
        <div className="container-wide">
          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5 lg:sticky lg:top-28 lg:pt-8">
              <p className="eyebrow text-gold">Origin</p>
              <TextReveal
                text={philosophyTitle}
                as="h2"
                className="mt-4 font-display text-4xl text-ink md:text-5xl"
              />
              <Reveal delay={0.15}>
                <p className="mt-6 max-w-md text-base leading-relaxed text-muted md:text-lg">
                  {philosophyBody}
                </p>
                <p className="mt-4 max-w-md text-base leading-relaxed text-muted md:text-lg">
                  Every silhouette begins with a conversation — how you move,
                  what you keep, what you want the world to remember.
                </p>
              </Reveal>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
              <ImageReveal
                direction="up"
                className="relative aspect-[3/4] w-full sm:mt-16"
              >
                <SafeImage src={imageA} alt="Origin story" fill sizes="40vw" />
              </ImageReveal>
              <ImageReveal
                direction="right"
                delay={0.1}
                className="relative aspect-[3/4] w-full"
              >
                <SafeImage src={imageB} alt="Atelier detail" fill sizes="40vw" />
              </ImageReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Full-bleed chapter image */}
      <section className="relative h-[55vh] min-h-[360px] overflow-hidden md:h-[70vh]">
        <SafeImage
          src={imageC}
          alt="Craft in light"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ink/35" />
        <div className="container-wide relative z-10 flex h-full items-end pb-12 md:pb-16">
          <Reveal>
            <p className="eyebrow text-gold-soft">Chapter II</p>
            <h2 className="mt-3 max-w-xl font-display text-4xl text-ivory md:text-5xl">
              {craftTitle}
            </h2>
          </Reveal>
        </div>
      </section>

      {/* Craft split */}
      <section className="section-pad bg-sand/25">
        <div className="container-wide grid items-center gap-12 lg:grid-cols-2">
          <Reveal direction="left">
            <p className="eyebrow text-gold">Materials</p>
            <h3 className="mt-4 font-display text-3xl text-ink md:text-4xl">
              Chosen for how they live
            </h3>
            <p className="mt-6 text-base leading-relaxed text-muted md:text-lg">
              {craftBody}
            </p>
            <ul className="mt-8 space-y-4 text-sm tracking-wide text-ink">
              {[
                "Italian silks with soft summer drape",
                "Japanese wools cut for lasting structure",
                "Hand finishing that disappears into the garment",
                "Natural dyes and sun-washed neutrals",
              ].map((item) => (
                <li key={item} className="flex gap-3 border-t border-border/80 pt-4">
                  <span className="text-gold" aria-hidden>
                    ✦
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <ImageReveal className="relative col-span-2 aspect-[16/10] w-full">
              <SafeImage src={imageD} alt="Material study" fill sizes="50vw" />
            </ImageReveal>
            <ImageReveal
              delay={0.08}
              direction="up"
              className="relative aspect-square w-full"
            >
              <SafeImage src={imageE} alt="Hand finishing" fill sizes="25vw" />
            </ImageReveal>
            <ImageReveal
              delay={0.12}
              direction="right"
              className="relative aspect-square w-full"
            >
              <SafeImage src={imageA} alt="Pattern work" fill sizes="25vw" />
            </ImageReveal>
          </div>
        </div>
      </section>
    </>
  );
}
