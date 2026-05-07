import { cn } from "@/lib/utils";

type SummaryCardProps = {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: "default" | "green" | "blue" | "amber" | "red" | "orange";
};

const colorMap = {
  default: {
    iconBg: "bg-neutral-100",
    iconText: "text-neutral-500",
    accent: "from-neutral-500/10"
  },
  green: {
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
    accent: "from-emerald-500/10"
  },
  blue: {
    iconBg: "bg-sky-50",
    iconText: "text-sky-600",
    accent: "from-sky-500/10"
  },
  amber: {
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
    accent: "from-amber-500/10"
  },
  red: {
    iconBg: "bg-rose-50",
    iconText: "text-rose-600",
    accent: "from-rose-500/10"
  },
  orange: {
    iconBg: "bg-orange-50",
    iconText: "text-orange-600",
    accent: "from-orange-500/10"
  }
};

export function SummaryCard({ label, value, icon, color = "default" }: SummaryCardProps) {
  const c = colorMap[color];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-subtle">
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r to-transparent", c.accent)} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-neutral-900">{value}</p>
        </div>
        {icon ? (
          <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", c.iconBg, c.iconText)}>
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
