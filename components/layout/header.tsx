"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";
import Image from "next/image";
import logoSdnBintaro from "@/components/asset/logosd-removebg-preview.png";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export function Header() {
  const { data } = useSession();

  return (
    <header className="no-print sticky top-0 z-30 border-b border-neutral-200 bg-[#FAFAFA]/95 px-3 py-3 backdrop-blur sm:px-4 md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-neutral-950">{data?.user?.name ?? "Pengguna"}</p>
            <p className="truncate text-xs text-neutral-500">{formatDate(new Date())}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Button type="button" variant="secondary" className="h-11 w-11 shrink-0 px-0 sm:h-10 sm:w-auto sm:px-4" onClick={() => void signOut({ callbackUrl: "/login" })} aria-label="Keluar">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Keluar</span>
          </Button>
          <Image src={logoSdnBintaro} alt="Logo SDN 1 Bintaro" width={48} height={48} className="h-12 w-12 shrink-0 object-contain" priority />
        </div>
      </div>
    </header>
  );
}
