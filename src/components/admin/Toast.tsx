"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type ToastItem = {
  id: number;
  message: string;
  type: "success" | "error" | "info";
};

type ToastContextValue = {
  toast: (message: string, type?: ToastItem["type"]) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback(
    (message: string, type: ToastItem["type"] = "info") => {
      const id = Date.now();
      setItems((prev) => [...prev, { id, message, type }]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    [],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[500] flex flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto min-w-[240px] rounded-sm border px-4 py-3 text-sm shadow-lg",
              item.type === "success" &&
                "border-emerald-200 bg-emerald-50 text-emerald-900",
              item.type === "error" &&
                "border-red-200 bg-red-50 text-red-900",
              item.type === "info" &&
                "border-border bg-white text-ink",
            )}
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
