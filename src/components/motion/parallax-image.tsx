"use client";

import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import Image, { type ImageProps } from "next/image";
import { useRef } from "react";

type ParallaxImageProps = Omit<ImageProps, "alt"> & {
  alt: string;
  className?: string;
  containerClassName?: string;
  intensity?: number;
};

export function ParallaxImage({
  alt,
  className,
  containerClassName,
  intensity = 36,
  ...imageProps
}: ParallaxImageProps) {
  const reducedMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-intensity, intensity]);

  if (reducedMotion) {
    return (
      <div className={cn("relative overflow-hidden", containerClassName)}>
        <Image alt={alt} className={cn("object-cover", className)} {...imageProps} />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", containerClassName)}
    >
      <motion.div style={{ y }} className="relative h-[115%] w-full -translate-y-[7.5%]">
        <Image
          alt={alt}
          className={cn("object-cover", className)}
          {...imageProps}
        />
      </motion.div>
    </div>
  );
}
