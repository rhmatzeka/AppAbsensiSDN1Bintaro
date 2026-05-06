"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export function Header() {
  const { data } = useSession();

  return (
    <header className="no-print sticky top-0 z-30 border-b border-neutral-200 bg-[#FAFAFA]/95 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="grid h-9 w-9 place-items-center rounded-xl bg-[#0A0A0A] text-xs font-semibold text-white md:hidden" aria-label="Dashboard">
            AS
          </Link>
          <Menu className="hidden h-5 w-5 text-neutral-400 max-md:block" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-neutral-950">{data?.user?.name ?? "Pengguna"}</p>
            <p className="truncate text-xs text-neutral-500">{formatDate(new Date())}</p>
          </div>
        </div>
        <Button type="button" variant="secondary" className="shrink-0" onClick={() => void signOut({ callbackUrl: "/login" })}>
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Keluar</span>
        </Button>
      </div>
    </header>
  );
}
