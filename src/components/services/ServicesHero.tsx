"use client";

import { SafeImage } from "@/components/ui/SafeImage";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { motion } from "framer-motion";

type ServicesHeroProps = {
  title: string;
  subtitle: string;
  eyebrow?: string;
  background?: { url?: string; alt?: string } | string | null;
};

const ease = [0.22, 1, 0.36, 1] as const;

export function ServicesHero({
  title,
  subtitle,
  eyebrow = "Atelier Services",
  background,
}: ServicesHeroProps) {
  const reduced = usePrefersReducedMotion();
  const words = title.split(" ");

  return (
    <section className="relative min-h-[85svh] overflow-hidden bg-ink md:min-h-[90svh]">
      <motion.div
        className="absolute inset-0"
        initial={reduced ? false : { scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.2, ease }}
      >
        <SafeImage
          src={background}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-65"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-ink/40" />
      </motion.div>

      <div className="container-wide relative z-10 flex min-h-[85svh] flex-col justify-center pb-24 pt-28 md:min-h-[90svh] md:pt-32">
        <motion.p
          className="eyebrow mb-5 text-gold"
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease }}
        >
          {eyebrow}
        </motion.p>

        <h1
          className="max-w-4xl font-display text-[clamp(3rem,7.5vw,6rem)] leading-[0.94] text-ivory"
          aria-label={title}
        >
          <span className="sr-only">{title}</span>
          <span aria-hidden className="flex flex-wrap gap-x-[0.28em]">
            {words.map((word, i) => (
              <span key={`${word}-${i}`} className="inline-block overflow-hidden">
                <motion.span
                  className="inline-block"
                  initial={reduced ? false : { y: "115%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.8, delay: 0.18 + i * 0.08, ease }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </span>
        </h1>

        <motion.p
          className="mt-7 max-w-xl text-lg leading-relaxed text-ivory/75 md:text-xl"
          initial={reduced ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease }}
        >
          {subtitle}
        </motion.p>
      </div>
    </section>
  );
}
