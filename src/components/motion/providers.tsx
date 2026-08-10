"use client";

import {
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
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

function subscribeIntroSeen() {
  return () => {};
}

function getIntroSeen(): boolean {
  try {
    return sessionStorage.getItem("lc-intro-seen") === "1";
  } catch {
    return true;
  }
}

function getIntroSeenServer(): boolean {
  return false;
}

export function MotionProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const introSeen = useSyncExternalStore(
    subscribeIntroSeen,
    getIntroSeen,
    getIntroSeenServer,
  );
  const [introJustFinished, setIntroJustFinished] = useState(false);

  if (isAdmin) return <>{children}</>;

  const siteReady = introSeen || introJustFinished;

  return (
    <>
      {/* Solid cover first — site never visible until intro completes */}
      {!siteReady ? (
        <div className="fixed inset-0 z-[280] bg-ink" aria-hidden />
      ) : null}

      {!siteReady ? (
        <CinematicIntro
          onComplete={() => {
            try {
              sessionStorage.setItem("lc-intro-seen", "1");
            } catch {
              /* ignore */
            }
            setIntroJustFinished(true);
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
