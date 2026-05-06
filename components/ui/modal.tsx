"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
};

export function Modal({ open, title, children, onClose, className }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className={cn("max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-xl bg-[#FAFAFA] p-5 shadow-xl sm:rounded-xl", className)}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-neutral-950">{title}</h2>
          <Button type="button" variant="ghost" className="h-9 w-9 px-0" onClick={onClose} aria-label="Tutup modal">
            <X className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
