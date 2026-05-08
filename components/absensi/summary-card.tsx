import { cn } from "@/lib/utils";

type SummaryCardProps = {
  label: string;
  mobileLabel?: string;
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

export function SummaryCard({ label, mobileLabel, value, icon, color = "default" }: SummaryCardProps) {
  const c = colorMap[color];
  const compactValue = String(value).length >= 4;

  return (
    <div className="relative min-h-20 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white px-2 py-2.5 shadow-subtle sm:min-h-0 sm:p-5">
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r to-transparent", c.accent)} />
      <div className={cn(
        "flex h-full min-w-0 flex-col items-center justify-center gap-1.5 text-center sm:items-start sm:justify-between sm:gap-3 sm:text-left",
        icon && "sm:flex-row"
      )}>
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase leading-3 text-neutral-400 sm:text-xs sm:font-semibold sm:leading-4">
            <span className="sm:hidden">{mobileLabel ?? label}</span>
            <span className="hidden sm:inline">{label}</span>
          </p>
          <p className={cn(
            "mt-1 whitespace-nowrap font-black leading-none text-neutral-900 sm:mt-2 sm:text-2xl sm:font-bold",
            compactValue ? "text-[19px]" : "text-2xl"
          )}>
            {value}
          </p>
        </div>
        {icon ? (
          <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-xl sm:h-10 sm:w-10", c.iconBg, c.iconText)}>
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
