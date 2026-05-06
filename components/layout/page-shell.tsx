import { cn } from "@/lib/utils";

export function PageShell({ title, description, action, children, className }: { title: string; description?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-neutral-950">{title}</h1>
          {description ? <p className="mt-1 text-sm text-neutral-500">{description}</p> : null}
        </div>
        {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
      </div>
      {children}
    </div>
  );
}
