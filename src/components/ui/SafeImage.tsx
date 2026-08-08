"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ImageMeta } from "@/models/shared";

const FALLBACK =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80";

type LooseImage =
  | string
  | (Partial<ImageMeta> & { url?: string; alt?: string })
  | null
  | undefined;

type SafeImageProps = {
  src?: LooseImage;
  alt?: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  focalX?: number;
  focalY?: number;
  fallbackClassName?: string;
};

function resolveSrc(src?: LooseImage) {
  if (!src) return FALLBACK;
  if (typeof src === "string") return src || FALLBACK;
  return src.url || FALLBACK;
}

function resolveAlt(src?: LooseImage, alt?: string) {
  if (alt) return alt;
  if (src && typeof src !== "string") return src.alt || "LUCCI CRENO editorial";
  return "LUCCI CRENO editorial";
}

export function SafeImage({
  src,
  alt,
  className,
  fill,
  width = 1200,
  height = 1600,
  priority,
  sizes = "(max-width: 768px) 100vw, 50vw",
  focalX,
  focalY,
  fallbackClassName,
}: SafeImageProps) {
  const [error, setError] = useState(false);
  const url = error ? FALLBACK : resolveSrc(src);
  const imageAlt = resolveAlt(src, alt);
  const meta = src && typeof src !== "string" ? src : null;
  const objectPosition =
    focalX != null && focalY != null
      ? `${focalX}% ${focalY}%`
      : meta?.focalX != null && meta?.focalY != null
        ? `${meta.focalX}% ${meta.focalY}%`
        : "center";

  const style = { objectPosition };

  if (error && !url) {
    return (
      <div
        role="img"
        aria-label={imageAlt}
        className={cn(
          "bg-gradient-to-br from-sand via-ivory to-aqua/30",
          fallbackClassName,
          className,
        )}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={url}
        alt={imageAlt}
        fill
        className={cn("object-cover", className)}
        style={style}
        sizes={sizes}
        priority={priority}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <Image
      src={url}
      alt={imageAlt}
      width={meta?.width ?? width}
      height={meta?.height ?? height}
      className={cn("object-cover", className)}
      style={style}
      sizes={sizes}
      priority={priority}
      onError={() => setError(true)}
    />
  );
}
