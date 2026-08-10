"use client";

import { Logo } from "@/components/brand/Logo";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useCallback, useEffect, useRef, useState } from "react";

const WORDS = ["Genuine", "Luxury", "Forever"] as const;

type CinematicIntroProps = {
  onComplete: () => void;
};

function unlockScroll() {
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
}

export function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    unlockScroll();
    setVisible(false);
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    // Hard failsafe — never trap the page
    const failsafe = window.setTimeout(finish, 4500);
    return () => {
      window.clearTimeout(failsafe);
      unlockScroll();
    };
  }, [finish]);

  useEffect(() => {
    if (reducedMotion) {
      const timer = window.setTimeout(finish, 400);
      return () => window.clearTimeout(timer);
    }

    const root = rootRef.current;
    if (!root) {
      finish();
      return;
    }

    let ctx: gsap.Context | undefined;
    try {
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          defaults: { ease: "power3.inOut" },
          onComplete: finish,
        });

        tl.from("[data-intro-monogram]", {
            scale: 0.82,
            autoAlpha: 0,
            duration: 0.5,
          })
          .from(
            "[data-intro-progress]",
            { scaleX: 0, transformOrigin: "left center", duration: 0.7 },
            "-=0.15",
          )
          .from(
            "[data-intro-word]",
            { y: 18, autoAlpha: 0, stagger: 0.18, duration: 0.4 },
            "-=0.3",
          )
          .from(
            "[data-intro-welcome] span",
            { yPercent: 110, stagger: 0.05, duration: 0.45 },
            "-=0.05",
          )
          .from(
            "[data-intro-brand]",
            { y: 16, autoAlpha: 0, duration: 0.4 },
            "-=0.15",
          )
          .to("[data-intro-curtain-left]", { xPercent: -100, duration: 0.65 }, "+=0.1")
          .to("[data-intro-curtain-right]", { xPercent: 100, duration: 0.65 }, "<")
          .to(root, { autoAlpha: 0, duration: 0.3 }, "-=0.2");

        if (tl.duration() > 3.8) {
          tl.timeScale(tl.duration() / 3.8);
        }
      }, root);
    } catch {
      finish();
    }

    return () => ctx?.revert();
  }, [reducedMotion, finish]);

  if (!visible) return null;

  if (reducedMotion) {
    return (
      <div
        className="fixed inset-0 z-[290] flex items-center justify-center bg-ink"
        aria-hidden
      >
        <Logo variant="monogram" className="h-14 w-14 text-ivory" />
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[290] overflow-hidden bg-ink"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to LUCCI CRENO"
    >
      <button
        type="button"
        onClick={finish}
        className={cn(
          "absolute right-6 top-6 z-20 px-3 py-1.5",
          "text-[0.65rem] uppercase tracking-[0.28em] text-ivory/70",
          "transition-colors hover:text-gold focus-visible:text-gold",
        )}
      >
        Skip
      </button>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-ivory">
        <div data-intro-monogram className="mb-10">
          <Logo variant="monogram" className="h-16 w-16 text-gold-soft" />
        </div>

        <div className="mb-8 h-px w-40 overflow-hidden bg-ivory/15">
          <div
            data-intro-progress
            className="h-full w-full origin-left bg-gold"
          />
        </div>

        <div className="mb-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {WORDS.map((word) => (
            <span
              key={word}
              data-intro-word
              className="font-display text-sm uppercase tracking-[0.32em] text-ivory/85"
            >
              {word}
            </span>
          ))}
        </div>

        <div
          data-intro-welcome
          className="overflow-hidden font-display text-3xl uppercase tracking-[0.22em] sm:text-4xl"
        >
          {"WELCOME HOME".split("").map((char, index) => (
            <span key={`${char}-${index}`} className="inline-block">
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </div>
        <p
          data-intro-brand
          className="mt-5 font-display text-sm uppercase tracking-[0.42em] text-gold-soft sm:text-base"
        >
          LUCCICRENO
        </p>
      </div>

      <div
        data-intro-curtain-left
        className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-ink"
      />
      <div
        data-intro-curtain-right
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-ink"
      />
    </div>
  );
}
