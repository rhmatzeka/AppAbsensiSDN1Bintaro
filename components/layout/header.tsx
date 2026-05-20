"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MobileSidebar } from "@/components/layout/sidebar";
import { toSameOriginPath } from "@/lib/same-origin-url";
import { formatDate } from "@/lib/utils";

export function Header() {
  const router = useRouter();
  const { data } = useSession();
  const userName = data?.user?.name ?? "Pengguna";
  const shortName = userName.split(" ").filter(Boolean)[0] ?? "Pengguna";
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="no-print sticky top-0 z-30 border-b border-neutral-200/80 bg-white/90 px-4 py-3 backdrop-blur-lg sm:px-5 md:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900 md:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Buka menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <p className="text-xs font-medium text-neutral-400">{formatDate(new Date())}</p>
              <h2 className="mt-0.5 text-sm font-bold text-neutral-900">
                <span className="block truncate sm:hidden">Halo, {shortName}</span>
                <span className="hidden truncate sm:block">Selamat datang, {userName}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-white text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-800 sm:w-auto sm:px-3"
              onClick={() => {
                void signOut({ callbackUrl: "/login", redirect: false }).then((result) => {
                  router.replace(toSameOriginPath(result.url, "/login"));
                  router.refresh();
                });
              }}
              aria-label="Keluar"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:ml-2 sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>
      <MobileSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
