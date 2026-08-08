import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
  className?: string;
};

export function PageHeader({
  title,
  description,
  actions,
  backHref,
  backLabel = "Back",
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        {backHref ? (
          <Link
            href={backHref}
            className="mb-2 inline-block text-xs uppercase tracking-[0.14em] text-muted hover:text-ink"
          >
            ← {backLabel}
          </Link>
        ) : null}
        <h1 className="font-display text-3xl text-ink">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
