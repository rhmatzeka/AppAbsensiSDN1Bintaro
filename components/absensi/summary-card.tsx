export function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-subtle">
      <p className="text-xs font-medium uppercase text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-neutral-950">{value}</p>
    </div>
  );
}
