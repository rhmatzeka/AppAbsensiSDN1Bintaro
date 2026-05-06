import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "@/types";

const statusClasses: Record<AttendanceStatus, string> = {
  HADIR: "bg-[#4CAF81]/15 text-[#2f7a59]",
  SAKIT: "bg-amber-100 text-amber-800",
  IZIN: "bg-orange-100 text-orange-800",
  ALPHA: "bg-[#E05252]/15 text-[#b33a3a]"
};

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", className)}>{children}</span>;
}

export function StatusBadge({ status }: { status: AttendanceStatus }) {
  return <Badge className={statusClasses[status]}>{status}</Badge>;
}
