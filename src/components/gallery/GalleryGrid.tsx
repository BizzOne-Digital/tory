"use client";

import { useMemo, useState } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import { Reveal } from "@/components/ui/Reveal";
import { useLightbox } from "@/components/gallery/Lightbox";
import { cn } from "@/lib/utils";
import type { GalleryCategoryData, GalleryImageData } from "@/types/cms";

type GalleryGridProps = {
  categories: GalleryCategoryData[];
  images: GalleryImageData[];
};

export function GalleryGrid({ categories, images }: GalleryGridProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const filtered = useMemo(() => {
    if (activeCategory === "all") return images;
    return images.filter((img) => img.categoryId === activeCategory);
  }, [images, activeCategory]);

  const lightboxImages = filtered.map((item) => item.image);
  const lightbox = useLightbox(lightboxImages);

  return (
    <div>
      <div className="mb-10 flex flex-wrap gap-3">
        <FilterChip active={activeCategory === "all"} onClick={() => setActiveCategory("all")}>
          All
        </FilterChip>
        {categories.map((cat) => (
          <FilterChip
            key={cat._id}
            active={activeCategory === cat._id}
            onClick={() => setActiveCategory(cat._id)}
          >
            {cat.name}
          </FilterChip>
        ))}
      </div>

      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {filtered.map((item, index) => (
          <Reveal key={item._id} className="mb-4 break-inside-avoid">
            <button
              type="button"
              className="group relative block w-full overflow-hidden"
              onClick={() => lightbox.open(index)}
              aria-label={item.title || item.image.alt || "Open gallery image"}
            >
              <div
                className={cn(
                  "relative overflow-hidden",
                  item.orientation === "landscape"
                    ? "aspect-[16/10]"
                    : item.orientation === "square"
                      ? "aspect-square"
                      : "aspect-[3/4]",
                )}
              >
                <SafeImage
                  src={item.image}
                  alt={item.image.alt}
                  fill
                  sizes="(max-width:768px) 100vw, 33vw"
                  className="transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              {(item.title || item.caption) && (
                <div className="mt-3 text-left">
                  {item.title ? (
                    <p className="font-display text-lg text-ink">{item.title}</p>
                  ) : null}
                  {item.caption ? (
                    <p className="text-sm text-muted">{item.caption}</p>
                  ) : null}
                </div>
              )}
            </button>
          </Reveal>
        ))}
      </div>

      {lightbox.dialog}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "border px-4 py-2 text-[0.68rem] uppercase tracking-[0.22em] transition-colors",
        active
          ? "border-ink bg-ink text-ivory"
          : "border-border bg-cream/60 text-muted hover:border-ink hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
