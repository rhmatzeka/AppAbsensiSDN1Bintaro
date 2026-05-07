import { Inbox } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 p-10 text-center animate-fade-in">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-orange-50 text-orange-400">
        <Inbox className="h-7 w-7" />
      </div>
      <h3 className="text-sm font-bold text-neutral-800">{title}</h3>
      <p className="mt-1.5 text-sm text-neutral-500">{description}</p>
    </div>
  );
}
