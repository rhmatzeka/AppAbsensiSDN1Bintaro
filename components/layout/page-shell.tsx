import { cn } from "@/lib/utils";

export function PageShell({ title, description, action, children, className }: { title: string; description?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-6 animate-fade-in", className)}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-[1.75rem]">{title}</h1>
          {description ? <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-neutral-500">{description}</p> : null}
        </div>
        {action ? <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto">{action}</div> : null}
      </div>
      {children}
    </div>
  );
}
