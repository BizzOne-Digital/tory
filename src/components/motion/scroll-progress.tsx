"use client";

import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  if (reduced) return null;

  return (
    <motion.div
      className="pointer-events-none fixed left-0 right-0 top-0 z-[200] h-[2px] origin-left bg-gold"
      style={{ scaleX }}
      aria-hidden
    />
  );
}
