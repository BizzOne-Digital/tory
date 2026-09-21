"use client";

import { ImageReveal } from "@/components/motion/image-reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { SafeImage } from "@/components/ui/SafeImage";
import { Reveal } from "@/components/ui/Reveal";
import type { ServiceData } from "@/types/cms";
import Link from "next/link";

type ServiceShowcaseProps = {
  services: ServiceData[];
};

export function ServiceShowcase({ services }: ServiceShowcaseProps) {
  if (!services.length) {
    return (
      <p className="py-20 text-center text-muted">
        Services will be published soon.
      </p>
    );
  }

  const [featured, ...rest] = services;

  return (
    <div className="space-y-0">
      {/* Featured large service */}
      <article className="border-b border-border/70">
        <Link
          href={`/services/${featured.slug}`}
          className="group container-wide grid items-center gap-10 py-16 no-underline md:py-24 lg:grid-cols-12 lg:gap-12"
        >
          <ImageReveal className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/11] lg:col-span-7 lg:aspect-[5/4]">
            <SafeImage
              src={featured.mainImage}
              alt={featured.name}
              fill
              sizes="(max-width:1024px) 100vw, 55vw"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
            />
          </ImageReveal>

          <div className="lg:col-span-5">
            <p className="eyebrow text-gold">Featured</p>
            <TextReveal
              text={featured.name}
              as="h2"
              className="mt-4 font-display text-4xl text-ink md:text-5xl"
            />
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-md text-base leading-relaxed text-muted md:text-lg">
                {featured.shortDescription}
              </p>
              <span className="mt-8 inline-flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.22em] text-ink transition-transform duration-500 group-hover:translate-x-1">
                {featured.ctaLabel || "Explore"}
                <span aria-hidden>→</span>
              </span>
            </Reveal>
          </div>
        </Link>
      </article>

      {/* Remaining services — alternating rows */}
      {rest.map((service, i) => {
        const reverse = i % 2 === 0;
        return (
          <article key={service._id} className="border-b border-border/70">
            <Link
              href={`/services/${service.slug}`}
              className="group container-wide grid items-center gap-8 py-14 no-underline md:py-20 lg:grid-cols-12 lg:gap-10"
            >
              <ImageReveal
                direction={reverse ? "left" : "right"}
                className={`relative aspect-[4/5] w-full overflow-hidden sm:aspect-[5/4] lg:col-span-6 lg:max-h-[380px] ${
                  reverse ? "lg:order-2" : "lg:order-1"
                }`}
              >
                <SafeImage
                  src={service.mainImage}
                  alt={service.name}
                  fill
                  sizes="(max-width:1024px) 100vw, 45vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
              </ImageReveal>

              <div
                className={`lg:col-span-6 ${
                  reverse ? "lg:order-1 lg:pr-8" : "lg:order-2 lg:pl-8"
                }`}
              >
                <p className="eyebrow text-gold">
                  {String(i + 2).padStart(2, "0")}
                </p>
                <h2 className="mt-3 font-display text-3xl text-ink transition-transform duration-500 group-hover:translate-x-1 md:text-4xl">
                  {service.name}
                </h2>
                <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
                  {service.shortDescription}
                </p>
                <span className="mt-7 inline-flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.22em] text-ink">
                  {service.ctaLabel || "Explore"}
                  <span
                    aria-hidden
                    className="transition-transform duration-500 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </div>
            </Link>
          </article>
        );
      })}
    </div>
  );
}
