import { cn } from "@/lib/utils";

type LoadingBlockProps = {
  label?: string;
  className?: string;
  lines?: number;
};

export function LoadingBlock({
  label = "Loading",
  className,
  lines = 3,
}: LoadingBlockProps) {
  return (
    <div
      className={cn("animate-pulse space-y-4", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">{label}</span>
      <div className="h-4 w-28 rounded bg-sand/80" />
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-3 rounded bg-sand/60",
            index === lines - 1 ? "w-4/5" : "w-full",
          )}
        />
      ))}
    </div>
  );
}
