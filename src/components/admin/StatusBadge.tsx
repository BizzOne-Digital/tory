import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  published: "bg-emerald-50 text-emerald-800 border-emerald-200",
  draft: "bg-amber-50 text-amber-900 border-amber-200",
  archived: "bg-stone-100 text-stone-600 border-stone-200",
  scheduled: "bg-sky-50 text-sky-800 border-sky-200",
  pending: "bg-amber-50 text-amber-900 border-amber-200",
  confirmed: "bg-blue-50 text-blue-800 border-blue-200",
  processing: "bg-indigo-50 text-indigo-800 border-indigo-200",
  shipped: "bg-violet-50 text-violet-800 border-violet-200",
  completed: "bg-emerald-50 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-50 text-red-800 border-red-200",
  unread: "bg-gold/15 text-ink border-gold/30",
  read: "bg-stone-100 text-stone-600 border-stone-200",
};

type StatusBadgeProps = {
  status: string;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const key = status.toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.68rem] font-medium uppercase tracking-[0.12em]",
        STATUS_STYLES[key] ?? "bg-stone-100 text-stone-700 border-stone-200",
        className,
      )}
    >
      {status}
    </span>
  );
}
