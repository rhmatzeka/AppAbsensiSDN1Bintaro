import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "min-h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-800 outline-none hover:border-neutral-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/15",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
