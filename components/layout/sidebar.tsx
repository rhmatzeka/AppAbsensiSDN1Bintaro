"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarCheck, GraduationCap, LayoutDashboard, PanelLeftClose, PanelLeftOpen, X, Users } from "lucide-react";
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
                  "flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-neutral-600 outline-none hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-[#F97316]",
                  active && "bg-[#F97316]/10 text-[#c2410c]",
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

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <div className={cn("fixed inset-0 z-50 md:hidden", open ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!open}>
      <button
        type="button"
        className={cn("absolute inset-0 bg-black/40 transition-opacity", open ? "opacity-100" : "opacity-0")}
        onClick={onClose}
        aria-label="Tutup navigasi"
      />
      <aside className={cn("absolute left-0 top-0 h-full w-[min(320px,85vw)] border-r border-neutral-200 bg-[#FAFAFA] p-4 shadow-xl transition-transform duration-150 ease-out", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="mb-8 flex items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-3" onClick={onClose}>
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#0A0A0A] text-sm font-semibold text-white">AS</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-950">Absensi Sekolah</p>
              <p className="truncate text-xs text-neutral-500">SDN 1 Bintaro</p>
            </div>
          </Link>
          <Button type="button" variant="ghost" className="h-10 w-10 px-0" onClick={onClose} aria-label="Tutup menu">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="space-y-2">
          {items.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium text-neutral-700 outline-none hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-[#F97316]",
                  active && "bg-[#F97316]/10 text-[#c2410c]"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-[#FAFAFA]/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgb(10_10_10_/_0.08)] backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-medium text-neutral-500 outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]",
                active && "bg-[#F97316]/10 text-[#c2410c]"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
