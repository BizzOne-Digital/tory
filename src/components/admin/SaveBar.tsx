"use client";

import { cn } from "@/lib/utils";

type SaveBarProps = {
  saving?: boolean;
  saved?: boolean;
  error?: string;
  onSave: () => void;
  label?: string;
  className?: string;
};

export function SaveBar({
  saving,
  saved,
  error,
  onSave,
  label = "Save changes",
  className,
}: SaveBarProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-30 -mx-4 mt-8 border-t border-border bg-[#f4f1ec]/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm">
          {error ? (
            <span className="text-red-700">{error}</span>
          ) : saved ? (
            <span className="text-emerald-700">Saved successfully.</span>
          ) : (
            <span className="text-muted">Unsaved changes</span>
          )}
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-sm bg-ink px-5 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-ivory hover:bg-ink-soft disabled:opacity-60"
        >
          {saving ? "Saving…" : label}
        </button>
      </div>
    </div>
  );
}
