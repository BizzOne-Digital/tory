"use client";

import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type MarqueeProps = {
  items: string[];
  className?: string;
  speed?: number;
};

export function Marquee({ items, className, speed = 40 }: MarqueeProps) {
  const reduced = usePrefersReducedMotion();
  const row = [...items, ...items];

  return (
    <div
      className={cn(
        "relative w-full max-w-[100vw] overflow-hidden border-y border-ink/10 bg-ink text-ivory",
        className,
      )}
    >
      <motion.div
        className="flex w-max gap-6 whitespace-nowrap py-3 pr-6 sm:gap-10 sm:py-4 sm:pr-10"
        animate={reduced ? undefined : { x: ["0%", "-50%"] }}
        transition={
          reduced
            ? undefined
            : { duration: speed, ease: "linear", repeat: Infinity }
        }
      >
        {row.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="inline-flex items-center gap-6 font-display text-lg tracking-[0.16em] text-ivory/85 sm:gap-10 sm:text-2xl sm:tracking-[0.18em]"
          >
            {item}
            <span className="text-gold" aria-hidden>
              ✦
            </span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
