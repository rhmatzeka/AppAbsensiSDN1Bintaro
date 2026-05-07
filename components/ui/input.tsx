import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "min-h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-800 outline-none placeholder:text-neutral-400 hover:border-neutral-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/15",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-800 outline-none placeholder:text-neutral-400 hover:border-neutral-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/15",
        className
      )}
      {...props}
    />
  );
}
