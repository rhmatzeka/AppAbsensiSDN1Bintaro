"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function Header() {
  const { data } = useSession();
  const userName = data?.user?.name ?? "Pengguna";

  return (
    <header className="no-print sticky top-0 z-30 border-b border-neutral-200/80 bg-white/90 px-4 py-3 backdrop-blur-lg sm:px-5 md:px-6">
      <div className="flex items-center justify-between gap-4">
        {/* Left: greeting */}
        <div className="min-w-0">
          <p className="text-xs font-medium text-neutral-400">{formatDate(new Date())}</p>
          <h2 className="mt-0.5 truncate text-sm font-bold text-neutral-900">
            Selamat datang, {userName} 👋
          </h2>
        </div>

        {/* Right: logout */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-800"
            onClick={() => void signOut({ callbackUrl: "/login" })}
            aria-label="Keluar"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
