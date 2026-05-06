import { cn } from "@/lib/utils";

export function PageShell({ title, description, action, children, className }: { title: string; description?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <h1 className="text-[clamp(1.75rem,7vw,2.25rem)] font-semibold leading-tight tracking-normal text-neutral-950 sm:text-2xl">{title}</h1>
          {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500 sm:mt-1">{description}</p> : null}
        </div>
        {action ? <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto">{action}</div> : null}
      </div>
      {children}
    </div>
  );
}
