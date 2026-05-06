export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-200 bg-white p-8 text-center">
      <h3 className="text-sm font-semibold text-neutral-950">{title}</h3>
      <p className="mt-1 text-sm text-neutral-500">{description}</p>
    </div>
  );
}
