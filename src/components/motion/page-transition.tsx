"use client";

import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";

type PageTransitionProps = {
  children: ReactNode;
};

/** Brief branded wipe on route change — never wraps/hides page content. */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const reducedMotion = usePrefersReducedMotion();
  const [showOverlay, setShowOverlay] = useState(false);
  const isFirst = useRef(true);
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (reducedMotion) return;
    if (isFirst.current) {
      isFirst.current = false;
      prevPath.current = pathname;
      return;
    }
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;

    setShowOverlay(true);
    const timer = window.setTimeout(() => setShowOverlay(false), 650);
    return () => window.clearTimeout(timer);
  }, [pathname, reducedMotion]);

  return (
    <>
      {children}
      <AnimatePresence>
        {showOverlay ? (
          <motion.div
            key={`wipe-${pathname}`}
            className="pointer-events-none fixed inset-0 z-[120] flex items-center justify-center bg-ink"
            initial={{ y: "0%" }}
            animate={{ y: "-105%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
            aria-hidden
          >
            <span className="font-display text-2xl tracking-[0.35em] text-ivory/90">
              LC
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
