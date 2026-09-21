"use client";

import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type TextRevealProps = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  delay?: number;
  mode?: "words" | "chars";
};

const ease = [0.22, 1, 0.36, 1] as const;

export function TextReveal({
  text,
  as: Tag = "h2",
  className,
  delay = 0,
  mode = "words",
}: TextRevealProps) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const [fallback, setFallback] = useState(false);
  const parts = mode === "chars" ? Array.from(text) : text.split(" ");

  useEffect(() => {
    const timer = window.setTimeout(() => setFallback(true), 400);
    return () => window.clearTimeout(timer);
  }, []);

  if (reduced) {
    return <Tag className={className}>{text}</Tag>;
  }

  const show = inView || fallback;

  return (
    <Tag ref={ref as never} className={cn(className)} aria-label={text}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="flex flex-wrap">
        {parts.map((part, i) => (
          <motion.span
            key={`${part}-${i}`}
            className="inline-block"
            initial={{ opacity: 0, y: 20 }}
            animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{
              duration: 0.5,
              delay: show ? delay + i * (mode === "chars" ? 0.015 : 0.045) : 0,
              ease,
            }}
          >
            {part === " " ? "\u00A0" : part}
            {mode === "words" && i < parts.length - 1 ? "\u00A0" : ""}
          </motion.span>
        ))}
      </span>
    </Tag>
  );
}
