import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-sm border border-dashed border-border bg-surface/50 px-6 py-16 text-center",
        className,
      )}
    >
      {Icon && (
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-cream text-gold">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="font-display text-2xl tracking-[0.04em] text-ink">{title}</h3>
      {description && (
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}
