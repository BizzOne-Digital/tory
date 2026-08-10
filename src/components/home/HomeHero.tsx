"use client";

import { SafeImage } from "@/components/ui/SafeImage";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { motion } from "framer-motion";
import Link from "next/link";

type HomeHeroProps = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  background?: { url?: string; alt?: string } | string | null;
};

const ease = [0.22, 1, 0.36, 1] as const;

export function HomeHero({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  background,
}: HomeHeroProps) {
  const reduced = usePrefersReducedMotion();
  const words = title.split(" ");

  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={reduced ? false : { scale: 1.18 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.4, ease }}
      >
        <SafeImage
          src={background}
          alt="LUCCI CRENO welcome home"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-ink/85 via-ink/40 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(20,24,28,0.45)_100%)]" />
      </motion.div>

      {/* Floating light leaks */}
      {!reduced ? (
        <>
          <motion.div
            className="pointer-events-none absolute left-0 top-1/4 h-56 w-56 rounded-full bg-coral/25 blur-3xl sm:h-72 sm:w-72"
            animate={{ x: [0, 40, 0], y: [0, -30, 0], opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute right-0 bottom-1/4 h-56 w-56 rounded-full bg-aqua/20 blur-3xl sm:h-80 sm:w-80"
            animate={{ x: [0, -30, 0], y: [0, 40, 0], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      ) : null}

      <div className="container-wide relative flex min-h-[100svh] flex-col justify-center pb-28 pt-28 lg:pb-32 lg:pt-32">
        <motion.p
          className="eyebrow mb-2 text-gold-soft"
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease }}
        >
          Welcome Home
        </motion.p>
        <motion.p
          className="mb-5 font-display text-sm uppercase tracking-[0.42em] text-ivory/90 sm:text-base"
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22, ease }}
        >
          LUCCICRENO
        </motion.p>

        <h1
          className="max-w-5xl font-display text-[clamp(3rem,8vw,6.5rem)] leading-[0.95] text-ivory"
          aria-label={title}
        >
          <span className="sr-only">{title}</span>
          <span aria-hidden className="flex flex-wrap gap-x-[0.28em]">
            {words.map((word, i) => (
              <span key={`${word}-${i}`} className="overflow-hidden inline-block">
                <motion.span
                  className="inline-block"
                  initial={reduced ? false : { y: "120%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.85, delay: 0.28 + i * 0.08, ease }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </span>
        </h1>

        <motion.p
          className="mt-7 max-w-2xl text-lg text-ivory/85 md:text-xl"
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease }}
        >
          {subtitle}
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap gap-4"
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9, ease }}
        >
          <Link href={ctaHref} className="btn-primary no-underline">
            {ctaLabel}
          </Link>
          <Link
            href={secondaryCtaHref}
            className="btn-secondary border-ivory/50 text-ivory no-underline hover:bg-ivory hover:text-ink"
          >
            {secondaryCtaLabel}
          </Link>
        </motion.div>

        {!reduced ? (
          <motion.div
            className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            <span className="text-[0.62rem] uppercase tracking-[0.3em] text-ivory/50">
              Scroll
            </span>
            <motion.span
              className="h-10 w-px bg-gradient-to-b from-gold to-transparent"
              animate={{ scaleY: [0.4, 1, 0.4], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
