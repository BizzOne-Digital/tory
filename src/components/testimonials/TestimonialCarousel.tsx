"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";
import type { TestimonialData } from "@/types/cms";

type TestimonialCarouselProps = {
  testimonials: TestimonialData[];
  eyebrow?: string;
  title?: string;
  /** When true, wraps in the full dark section shell */
  withSection?: boolean;
  className?: string;
};

function subscribeMd(onChange: () => void) {
  const mq = window.matchMedia("(min-width: 768px)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getMdSnapshot() {
  return window.matchMedia("(min-width: 768px)").matches ? 2 : 1;
}

function QuoteMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 36"
      className={cn("h-10 w-12", className)}
      aria-hidden
      fill="currentColor"
    >
      <path d="M0 36V18.4C0 8.2 6.1 1.4 18.2 0v8.1c-5.5.9-8.2 3.8-8.2 8.7V18H22v18H0zm26 0V18.4C26 8.2 32.1 1.4 44.2 0v8.1c-5.5.9-8.2 3.8-8.2 8.7V18H48v18H26z" />
    </svg>
  );
}

function TestimonialCard({ item }: { item: TestimonialData }) {
  const roleLine = [item.role, item.location].filter(Boolean).join(" · ");

  return (
    <article className="flex h-full min-h-[280px] flex-col rounded-2xl bg-[#1a1a1a] px-8 py-9 sm:px-10 sm:py-10 md:min-h-[320px]">
      <QuoteMark className="mb-6 text-gold" />
      <blockquote className="flex-1 text-[1.05rem] leading-relaxed text-white/90 sm:text-lg">
        “{item.quote}”
      </blockquote>
      <footer className="mt-8">
        <p className="text-base font-semibold tracking-wide text-white">
          {item.name}
        </p>
        {roleLine ? (
          <p className="mt-1.5 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-gold">
            {roleLine}
          </p>
        ) : null}
      </footer>
    </article>
  );
}

export function TestimonialCarousel({
  testimonials,
  eyebrow = "Client Stories",
  title = "What Clients Say",
  withSection = true,
  className,
}: TestimonialCarouselProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [page, setPage] = useState(0);
  const perPage = useSyncExternalStore(subscribeMd, getMdSnapshot, () => 2);
  const count = testimonials.length;
  const pageCount = Math.max(1, Math.ceil(count / perPage));
  const safePage = Math.min(page, pageCount - 1);

  const go = useCallback(
    (dir: -1 | 1) => {
      setPage((p) => {
        const current = Math.min(p, pageCount - 1);
        return (current + dir + pageCount) % pageCount;
      });
    },
    [pageCount],
  );

  useEffect(() => {
    if (count <= perPage || reducedMotion) return;
    const timer = window.setInterval(() => go(1), 8000);
    return () => window.clearInterval(timer);
  }, [count, perPage, reducedMotion, go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (!count) {
    const empty = (
      <p className="text-center text-white/50">
        Client stories will appear here once published.
      </p>
    );
    if (!withSection) return empty;
    return (
      <section className={cn("bg-ink py-20 md:py-28", className)}>
        <div className="container-wide">{empty}</div>
      </section>
    );
  }

  const start = safePage * perPage;
  const visible = testimonials.slice(start, start + perPage);

  const inner = (
    <div
      className={cn("container-wide", !withSection && className)}
      aria-roledescription="carousel"
      aria-label="Client testimonials"
    >
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-[0.72rem] font-medium uppercase tracking-[0.32em] text-gold">
          {eyebrow}
        </p>
        <h2 className="mt-4 font-display text-4xl tracking-[0.04em] text-white sm:text-5xl md:text-6xl">
          {title}
        </h2>
      </header>

      <div className="relative mt-14 md:mt-16">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${safePage}-${perPage}`}
            className="grid gap-5 md:grid-cols-2 md:gap-6"
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {visible.map((item) => (
              <TestimonialCard key={item._id} item={item} />
            ))}
            {perPage === 2 && visible.length === 1 ? (
              <div className="hidden md:block" aria-hidden />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      {pageCount > 1 ? (
        <div className="mt-12 flex items-center justify-center gap-5">
          <button
            type="button"
            aria-label="Previous testimonials"
            onClick={() => go(-1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/35 text-white transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
          </button>

          <div
            className="flex items-center gap-2.5"
            role="tablist"
            aria-label="Testimonial pages"
          >
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === safePage}
                aria-label={`Show testimonials page ${i + 1}`}
                onClick={() => setPage(i)}
                className={cn(
                  "transition-all duration-300",
                  i === safePage
                    ? "h-1 w-7 rounded-full bg-gold"
                    : "h-2 w-2 rounded-full bg-white/35 hover:bg-white/60",
                )}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Next testimonials"
            onClick={() => go(1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/35 text-white transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      ) : null}
    </div>
  );

  if (!withSection) return inner;

  return (
    <section className={cn("bg-ink py-20 text-white md:py-28", className)}>
      {inner}
    </section>
  );
}
