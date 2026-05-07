import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "@/types";

const statusConfig: Record<AttendanceStatus, { bg: string; dot: string; label: string }> = {
  HADIR: { bg: "bg-emerald-50 text-emerald-700 border border-emerald-200/60", dot: "bg-emerald-500", label: "Hadir" },
  SAKIT: { bg: "bg-sky-50 text-sky-700 border border-sky-200/60", dot: "bg-sky-500", label: "Sakit" },
  IZIN: { bg: "bg-amber-50 text-amber-700 border border-amber-200/60", dot: "bg-amber-500", label: "Izin" },
  ALPHA: { bg: "bg-rose-50 text-rose-700 border border-rose-200/60", dot: "bg-rose-500", label: "Alpha" }
};

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", className)}>{children}</span>;
}

export function StatusBadge({ status }: { status: AttendanceStatus }) {
  const config = statusConfig[status];
  return (
    <Badge className={cn("gap-1.5", config.bg)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </Badge>
  );
}
