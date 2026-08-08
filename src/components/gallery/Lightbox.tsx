"use client";

import { useCallback, useEffect, useId, useState, type ReactNode } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import { cn } from "@/lib/utils";
import type { ImageMeta } from "@/models/shared";

type LightboxProps = {
  images: ImageMeta[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

export function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  const titleId = useId();
  const open = index != null && images[index];

  const prev = useCallback(() => {
    if (index == null) return;
    onNavigate((index - 1 + images.length) % images.length);
  }, [index, images.length, onNavigate]);

  const next = useCallback(() => {
    if (index == null) return;
    onNavigate((index + 1) % images.length);
  }, [index, images.length, onNavigate]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, prev, next]);

  if (!open) return null;

  const current = images[index!];

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-ink/95 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute right-4 top-4 z-10 px-3 py-2 text-sm uppercase tracking-[0.2em] text-ivory"
        onClick={onClose}
      >
        Close
      </button>
      <button
        type="button"
        className="absolute left-4 top-1/2 -translate-y-1/2 px-3 py-2 text-ivory"
        aria-label="Previous image"
        onClick={(e) => {
          e.stopPropagation();
          prev();
        }}
      >
        ←
      </button>
      <button
        type="button"
        className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-2 text-ivory"
        aria-label="Next image"
        onClick={(e) => {
          e.stopPropagation();
          next();
        }}
      >
        →
      </button>
      <div
        className="relative h-[min(85vh,900px)] w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <SafeImage src={current} alt={current.alt} fill sizes="90vw" className="object-contain" />
        <p id={titleId} className="sr-only">
          {current.alt || "Gallery image"} · {index! + 1} of {images.length}
        </p>
        {current.caption ? (
          <p className="absolute bottom-0 left-0 right-0 bg-ink/60 px-4 py-3 text-center text-sm text-ivory">
            {current.caption}
          </p>
        ) : null}
      </div>
    </div>
  );
}

type LightboxTriggerProps = {
  images: ImageMeta[];
  index: number;
  className?: string;
  children?: ReactNode;
};

export function LightboxTrigger({
  images,
  index,
  className,
  children,
}: LightboxTriggerProps) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <>
      <button
        type="button"
        className={cn("block w-full text-left", className)}
        onClick={() => setActive(index)}
        aria-label={`Open image ${index + 1}`}
      >
        {children}
      </button>
      <Lightbox
        images={images}
        index={active}
        onClose={() => setActive(null)}
        onNavigate={setActive}
      />
    </>
  );
}

export function useLightbox(images: ImageMeta[]) {
  const [index, setIndex] = useState<number | null>(null);
  return {
    index,
    open: (i: number) => setIndex(i),
    close: () => setIndex(null),
    navigate: setIndex,
    dialog: (
      <Lightbox
        images={images}
        index={index}
        onClose={() => setIndex(null)}
        onNavigate={setIndex}
      />
    ),
  };
}
