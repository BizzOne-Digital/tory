import { Footer, type FooterSettings } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

type SiteShellProps = {
  children: ReactNode;
  settings: FooterSettings;
  className?: string;
  mainClassName?: string;
};

export function SiteShell({
  children,
  settings,
  className,
  mainClassName,
}: SiteShellProps) {
  return (
    <div
      className={cn(
        "flex min-h-full w-full max-w-[100vw] flex-col overflow-x-hidden",
        className,
      )}
    >
      <Header />
      <main
        id="main-content"
        className={cn("w-full min-w-0 flex-1 overflow-x-hidden", mainClassName)}
      >
        {children}
      </main>
      <Footer settings={settings} />
    </div>
  );
}
