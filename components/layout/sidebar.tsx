"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarCheck, GraduationCap, LayoutDashboard, PanelLeftClose, PanelLeftOpen, X, Users } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import logoSdnBintaro from "@/components/asset/logosd-removebg-preview.png";

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
    <aside className={cn("no-print sticky top-0 hidden h-screen shrink-0 border-r border-neutral-200/80 bg-white p-3 md:block", collapsed ? "w-[76px]" : "w-[260px]")}>
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="mb-2 flex items-center justify-between gap-2 px-2 py-1">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-50">
              <Image src={logoSdnBintaro} alt="Logo SDN 1 Bintaro" width={32} height={32} className="h-8 w-8 object-contain" />
            </div>
            {!collapsed ? (
              <div className="min-w-0">
                <span className="block truncate text-sm font-bold text-neutral-900">SDN 1 Bintaro</span>
                <span className="block truncate text-[11px] text-neutral-400">Sistem Absensi</span>
              </div>
            ) : null}
          </Link>
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
            onClick={() => setCollapsed((value) => !value)}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        {/* Separator */}
        <div className="mx-2 mb-3 border-b border-neutral-100" />

        {/* Label */}
        {!collapsed ? (
          <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Menu</p>
        ) : null}

        {/* Navigation */}
        <nav className="space-y-1 px-1">
          {items.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-neutral-500 outline-none transition-all hover:bg-neutral-50 hover:text-neutral-800 focus-visible:ring-2 focus-visible:ring-orange-400",
                  active && "bg-orange-50 text-orange-700 font-semibold shadow-sm",
                  collapsed && "justify-center px-0"
                )}
              >
                <div className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors",
                  active ? "bg-orange-100 text-orange-600" : "text-neutral-400 group-hover:text-neutral-600"
                )}>
                  <Icon className="h-[18px] w-[18px]" />
                </div>
                {!collapsed ? <span>{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto px-2">
          <div className={cn("rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 p-3", collapsed && "hidden")}>
            <p className="text-xs font-semibold text-orange-800">Tahun Ajar</p>
            <p className="mt-0.5 text-xs text-orange-600">2024/2025</p>
          </div>
        </div>
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
        className={cn("absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity", open ? "opacity-100" : "opacity-0")}
        onClick={onClose}
        aria-label="Tutup navigasi"
      />
      <aside className={cn("absolute left-0 top-0 h-full w-[min(300px,85vw)] bg-white p-4 shadow-xl transition-transform duration-200 ease-out", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-3" onClick={onClose}>
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-orange-50">
              <Image src={logoSdnBintaro} alt="Logo SDN 1 Bintaro" width={36} height={36} className="h-9 w-9 object-contain" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-neutral-900">SDN 1 Bintaro</p>
              <p className="truncate text-xs text-neutral-400">Sistem Absensi</p>
            </div>
          </Link>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-xl text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
            onClick={onClose}
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Menu</p>

        <nav className="space-y-1">
          {items.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium text-neutral-500 outline-none transition-all hover:bg-neutral-50 hover:text-neutral-800 focus-visible:ring-2 focus-visible:ring-orange-400",
                  active && "bg-orange-50 text-orange-700 font-semibold"
                )}
              >
                <div className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors",
                  active ? "bg-orange-100 text-orange-600" : "text-neutral-400 group-hover:text-neutral-600"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
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
    <nav className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200/80 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-4px_16px_rgb(0_0_0_/_0.06)] backdrop-blur-lg md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-0.5">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] font-semibold text-neutral-400 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-orange-400",
                active && "text-orange-600"
              )}
            >
              <div className={cn(
                "grid h-7 w-7 place-items-center rounded-lg transition-colors",
                active && "bg-orange-100"
              )}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
