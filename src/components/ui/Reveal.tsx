"use client";

import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";
import { motion, useInView, type HTMLMotionProps } from "framer-motion";
import { type ReactNode, useEffect, useRef, useState } from "react";

type RevealDirection = "left" | "right" | "up" | "down";

type RevealProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children: ReactNode;
  direction?: RevealDirection;
  delay?: number;
  once?: boolean;
  y?: number;
};

const ease = [0.22, 1, 0.36, 1] as const;

function getOffset(direction: RevealDirection, distance: number) {
  switch (direction) {
    case "left":
      return { x: -distance, y: 0 };
    case "right":
      return { x: distance, y: 0 };
    case "up":
      return { x: 0, y: distance };
    case "down":
      return { x: 0, y: -distance };
  }
}

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  once = true,
  y = 28,
  className,
  ...rest
}: RevealProps) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, amount: 0.05, margin: "0px 0px -40px 0px" });
  const [fallback, setFallback] = useState(false);
  const offset = getOffset(direction, y);

  useEffect(() => {
    const timer = window.setTimeout(() => setFallback(true), 400);
    return () => window.clearTimeout(timer);
  }, []);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  const show = inView || fallback;

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial={{ opacity: 0, ...offset }}
      animate={show ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...offset }}
      transition={{ duration: 0.7, delay: show ? delay : 0, ease }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
