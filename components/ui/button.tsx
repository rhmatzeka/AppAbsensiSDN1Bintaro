import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-[#5C6BC0] text-white hover:bg-[#4d59aa] shadow-sm",
  secondary: "bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50",
  ghost: "bg-transparent text-neutral-700 hover:bg-neutral-100",
  danger: "bg-[#E05252] text-white hover:bg-[#c84242]"
};

export function Button({ className, variant = "primary", loading, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#5C6BC0] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
        variants[variant],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
