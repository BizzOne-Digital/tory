"use client";

import { TextReveal } from "@/components/motion/text-reveal";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { type ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  body?: string;
  align?: "left" | "center";
  className?: string;
  action?: ReactNode;
};

const ease = [0.22, 1, 0.36, 1] as const;

export function SectionHeading({
  eyebrow,
  title,
  description,
  body,
  align = "left",
  className,
  action,
}: SectionHeadingProps) {
  const copy = body ?? description;
  const centered = align === "center";
  const reduced = usePrefersReducedMotion();

  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-4 text-ink sm:mb-12",
        centered && "items-center text-center",
        action && "sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={cn("space-y-3", centered && "max-w-2xl")}>
        {eyebrow ? (
          <motion.p
            className="eyebrow"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease }}
          >
            {eyebrow}
          </motion.p>
        ) : null}
        <TextReveal
          text={title}
          as="h2"
          className="font-display text-3xl tracking-[0.04em] text-current sm:text-4xl md:text-5xl"
        />
        {copy ? (
          <motion.p
            className="max-w-2xl text-sm leading-relaxed text-muted sm:text-base"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, delay: 0.15, ease }}
          >
            {copy}
          </motion.p>
        ) : null}
      </div>
      {action ? <div className={cn(centered && "sm:mt-0")}>{action}</div> : null}
    </div>
  );
}
