"use client";

import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { cn } from "@/lib/utils";
import type { PageHero } from "@/types/cms";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";

type PageHeroProps = {
  hero?: PageHero;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
  size?: "default" | "compact";
  className?: string;
};

export function PageHeroBlock({
  hero,
  fallbackTitle = "LUCCI CRENO",
  fallbackSubtitle,
  size = "default",
  className,
}: PageHeroProps) {
  const title = hero?.title || fallbackTitle;
  const subtitle = hero?.subtitle || fallbackSubtitle;
  const reduced = usePrefersReducedMotion();
  const minH = size === "default" ? "min-h-[72vh]" : "min-h-[48vh]";

  return (
    <section className={cn("relative overflow-hidden", minH, className)}>
      <div className="absolute inset-0">
        <SafeImage
          src={hero?.background}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/35 to-ink/15" />
      </div>

      <div
        className={cn(
          "container-wide relative z-10 flex items-center pb-20 pt-28",
          minH,
        )}
      >
        <motion.div
          className="max-w-3xl text-ivory"
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {hero?.eyebrow ? (
            <p className="eyebrow mb-4 text-gold-soft">{hero.eyebrow}</p>
          ) : null}
          <h1 className="font-display text-[clamp(2.5rem,6vw,4.75rem)] leading-[1.02]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-4 max-w-2xl text-lg text-ivory/85 md:text-xl">
              {subtitle}
            </p>
          ) : null}
          {hero?.body ? (
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-ivory/75 md:text-base">
              {hero.body}
            </p>
          ) : null}
          {(hero?.ctaLabel && hero?.ctaHref) ||
          (hero?.secondaryCtaLabel && hero?.secondaryCtaHref) ? (
            <div className="mt-8 flex flex-wrap gap-4">
              {hero?.ctaLabel && hero?.ctaHref ? (
                <Link href={hero.ctaHref} className="btn-primary no-underline">
                  {hero.ctaLabel}
                </Link>
              ) : null}
              {hero?.secondaryCtaLabel && hero?.secondaryCtaHref ? (
                <Link
                  href={hero.secondaryCtaHref}
                  className="btn-secondary border-ivory/60 text-ivory no-underline hover:bg-ivory hover:text-ink"
                >
                  {hero.secondaryCtaLabel}
                </Link>
              ) : null}
            </div>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
