"use client";

import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";
import { motion, useInView } from "framer-motion";
import { type ReactNode, useEffect, useRef, useState } from "react";

type ImageRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "left" | "right" | "up" | "scale";
};

const ease = [0.22, 1, 0.36, 1] as const;

export function ImageReveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: ImageRevealProps) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.05, margin: "0px 0px -40px 0px" });
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setFallback(true), 400);
    return () => window.clearTimeout(timer);
  }, []);

  if (reduced) {
    return <div className={cn("relative overflow-hidden", className)}>{children}</div>;
  }

  const from =
    direction === "left"
      ? { opacity: 0, x: -40 }
      : direction === "right"
        ? { opacity: 0, x: 40 }
        : direction === "scale"
          ? { opacity: 0, scale: 1.06 }
          : { opacity: 0, y: 40 };

  const show = inView || fallback;

  return (
    <motion.div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      initial={from}
      animate={show ? { opacity: 1, x: 0, y: 0, scale: 1 } : from}
      transition={{ duration: 0.85, delay: show ? delay : 0, ease }}
    >
      <div className="absolute inset-0">{children}</div>
    </motion.div>
  );
}
