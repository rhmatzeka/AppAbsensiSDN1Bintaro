"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
};

export function Modal({ open, title, children, onClose, className }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl animate-slide-up sm:max-h-[92vh]", className)}>
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-neutral-100 px-5 py-4 sm:px-6">
          <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-xl text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
            onClick={onClose}
            aria-label="Tutup modal"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>
      </div>
    </div>
  );
}
