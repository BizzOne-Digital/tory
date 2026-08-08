"use client";

import { SafeImage } from "@/components/ui/SafeImage";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import type { GalleryImageData } from "@/types/cms";
import { motion } from "framer-motion";
import Link from "next/link";

type LookbookStripProps = {
  images: GalleryImageData[];
};

export function LookbookStrip({ images }: LookbookStripProps) {
  const reduced = usePrefersReducedMotion();
  if (!images.length) return null;

  const loop = [...images, ...images];

  return (
    <div className="relative w-full max-w-[100vw] overflow-hidden">
      <motion.div
        className="flex w-max gap-3 pr-4 sm:gap-4"
        animate={reduced ? undefined : { x: ["0%", "-50%"] }}
        transition={
          reduced
            ? undefined
            : { duration: 48, ease: "linear", repeat: Infinity }
        }
        whileHover={reduced ? undefined : { animationPlayState: "paused" }}
      >
        {loop.map((item, i) => (
          <Link
            key={`${item._id}-${i}`}
            href="/gallery"
            className="group relative h-[300px] w-[210px] shrink-0 overflow-hidden no-underline sm:h-[380px] sm:w-[260px] md:h-[480px] md:w-[300px]"
          >
            <SafeImage
              src={item.image}
              alt={item.image?.alt || item.title || "Lookbook"}
              fill
              sizes="320px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            {item.title ? (
              <p className="absolute bottom-4 left-4 translate-y-2 text-sm text-ivory opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                {item.title}
              </p>
            ) : null}
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
