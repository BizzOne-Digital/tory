"use client";

import { SafeImage } from "@/components/ui/SafeImage";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { motion } from "framer-motion";

type AboutHeroProps = {
  title: string;
  subtitle: string;
  eyebrow?: string;
  background?: { url?: string; alt?: string } | string | null;
  sideImage?: { url?: string; alt?: string } | string | null;
};

const ease = [0.22, 1, 0.36, 1] as const;

export function AboutHero({
  title,
  subtitle,
  eyebrow = "Our Story",
  background,
  sideImage,
}: AboutHeroProps) {
  const reduced = usePrefersReducedMotion();
  const words = title.split(" ");

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-ink">
      <motion.div
        className="absolute inset-0"
        initial={reduced ? false : { scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.2, ease }}
      >
        <SafeImage
          src={background}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-ink/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />
      </motion.div>

      <div className="container-wide relative z-10 grid min-h-[100svh] items-center gap-10 pb-24 pt-28 lg:grid-cols-[1.2fr_0.8fr] lg:pb-28 lg:pt-32">
        <div className="max-w-3xl text-ivory">
          <motion.p
            className="eyebrow mb-6 text-gold"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            {eyebrow}
          </motion.p>

          <h1
            className="font-display text-[clamp(3.2rem,8vw,6.5rem)] leading-[0.92]"
            aria-label={title}
          >
            <span className="sr-only">{title}</span>
            <span aria-hidden className="flex flex-wrap gap-x-[0.28em]">
              {words.map((word, i) => (
                <span key={`${word}-${i}`} className="overflow-hidden inline-block">
                  <motion.span
                    className="inline-block"
                    initial={reduced ? false : { y: "115%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.08, ease }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </span>
          </h1>

          <motion.p
            className="mt-8 max-w-xl text-lg leading-relaxed text-ivory/75 md:text-xl"
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65, ease }}
          >
            {subtitle}
          </motion.p>
        </div>

        <motion.div
          className="relative mx-auto hidden aspect-[3/4] w-full max-w-sm overflow-hidden lg:block lg:justify-self-end"
          initial={reduced ? false : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease }}
        >
          <SafeImage
            src={sideImage ?? background}
            alt="Atelier portrait"
            fill
            sizes="380px"
            className="object-cover"
          />
          <div className="absolute inset-0 ring-1 ring-inset ring-ivory/20" />
        </motion.div>
      </div>

      {!reduced ? (
        <motion.div
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <span className="text-[0.62rem] uppercase tracking-[0.3em] text-ivory/45">
            Scroll the story
          </span>
          <motion.span
            className="h-12 w-px origin-top bg-gradient-to-b from-gold to-transparent"
            animate={{ scaleY: [0.35, 1, 0.35], opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      ) : null}
    </section>
  );
}
