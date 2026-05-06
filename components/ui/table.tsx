import { cn } from "@/lib/utils";

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-neutral-200 bg-white">
      <table className={cn("w-full min-w-[720px] border-collapse text-left text-sm", className)} {...props} />
    </div>
  );
}

export function Th({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-semibold uppercase text-neutral-500", className)} {...props} />;
}

export function Td({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("border-b border-neutral-100 px-4 py-3 align-middle text-neutral-700", className)} {...props} />;
}
