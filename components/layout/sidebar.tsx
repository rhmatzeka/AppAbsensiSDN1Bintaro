"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarCheck, GraduationCap, LayoutDashboard, PanelLeftClose, PanelLeftOpen, Users } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/absensi", label: "Absensi", icon: CalendarCheck },
  { href: "/siswa", label: "Siswa", icon: Users },
  { href: "/kelas", label: "Kelas", icon: GraduationCap },
  { href: "/laporan", label: "Laporan", icon: BarChart3 }
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn("no-print sticky top-0 hidden h-screen shrink-0 border-r border-neutral-200 bg-[#FAFAFA] p-3 md:block", collapsed ? "w-[76px]" : "w-64")}>
      <div className="flex h-full flex-col">
        <div className="mb-6 flex items-center justify-between gap-2 px-2">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#0A0A0A] text-sm font-semibold text-white">AS</div>
            {!collapsed ? <span className="truncate text-sm font-semibold text-neutral-950">Absensi Sekolah</span> : null}
          </Link>
          <Button type="button" variant="ghost" className="h-9 w-9 px-0" onClick={() => setCollapsed((value) => !value)} aria-label="Toggle sidebar">
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="space-y-1">
          {items.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-neutral-600 outline-none hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-[#5C6BC0]",
                  active && "bg-[#5C6BC0]/10 text-[#4d59aa]",
                  collapsed && "justify-center px-0"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed ? <span>{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
