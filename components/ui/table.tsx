import { cn } from "@/lib/utils";

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-neutral-200/80 bg-white shadow-subtle [-webkit-overflow-scrolling:touch]">
      <table className={cn("w-full min-w-[720px] border-collapse text-left text-sm", className)} {...props} />
    </div>
  );
}

export function Th({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("border-b border-neutral-100 bg-neutral-50/60 px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-neutral-500", className)} {...props} />;
}

export function Td({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("border-b border-neutral-100/80 px-4 py-3.5 align-middle text-neutral-600", className)} {...props} />;
}
