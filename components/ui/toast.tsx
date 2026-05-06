"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ToastType = "success" | "error";
type Toast = {
  id: number;
  type: ToastType;
  message: string;
};
type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast(message, type = "success") {
        const id = Date.now();
        setToasts((current) => [...current, { id, type, message }]);
        window.setTimeout(() => {
          setToasts((current) => current.filter((toast) => toast.id !== id));
        }, 3500);
      }
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[60] flex w-[min(360px,calc(100vw-32px))] flex-col gap-2">
        {toasts.map((toast) => (
          <div key={toast.id} className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-subtle">
            {toast.type === "success" ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#4CAF81]" /> : <AlertCircle className="mt-0.5 h-5 w-5 text-[#E05252]" />}
            <p className="flex-1 text-sm text-neutral-800">{toast.message}</p>
            <Button type="button" variant="ghost" className="h-7 w-7 px-0" onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))} aria-label="Tutup toast">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
