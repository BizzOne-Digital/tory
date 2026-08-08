"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const SmoothScroll = dynamic(
  () => import("./smooth-scroll").then((m) => m.SmoothScroll),
  { ssr: false },
);

const PageTransition = dynamic(
  () => import("./page-transition").then((m) => m.PageTransition),
  { ssr: false },
);

const CinematicIntro = dynamic(
  () => import("./cinematic-intro").then((m) => m.CinematicIntro),
  { ssr: false },
);

const ScrollProgress = dynamic(
  () => import("./scroll-progress").then((m) => m.ScrollProgress),
  { ssr: false },
);

type Phase = "boot" | "intro" | "site";

export function MotionProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const [phase, setPhase] = useState<Phase>("boot");

  useEffect(() => {
    if (isAdmin) {
      setPhase("site");
      return;
    }
    try {
      const seen = sessionStorage.getItem("lc-intro-seen") === "1";
      setPhase(seen ? "site" : "intro");
    } catch {
      setPhase("site");
    }
  }, [isAdmin]);

  if (isAdmin) return <>{children}</>;

  const siteReady = phase === "site";

  return (
    <>
      {/* Solid cover first — site never visible until intro completes */}
      {!siteReady ? (
        <div className="fixed inset-0 z-[280] bg-ink" aria-hidden />
      ) : null}

      {phase === "intro" ? (
        <CinematicIntro
          onComplete={() => {
            try {
              sessionStorage.setItem("lc-intro-seen", "1");
            } catch {
              /* ignore */
            }
            setPhase("site");
          }}
        />
      ) : null}

      <div
        className={siteReady ? undefined : "max-h-screen overflow-hidden"}
        style={
          siteReady
            ? undefined
            : { visibility: "hidden", pointerEvents: "none" }
        }
        aria-hidden={!siteReady}
      >
        {siteReady ? <SmoothScroll /> : null}
        {siteReady ? <ScrollProgress /> : null}
        <PageTransition>{children}</PageTransition>
      </div>
    </>
  );
}
