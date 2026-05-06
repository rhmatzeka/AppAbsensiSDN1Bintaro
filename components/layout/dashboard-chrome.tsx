"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { MobileBottomNav, MobileSidebar, Sidebar } from "@/components/layout/sidebar";

export function DashboardChrome({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px] bg-[#FAFAFA]">
      <Sidebar />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="min-w-0 flex-1">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="pb-24 pl-4 pr-4 pt-5 sm:p-5 md:p-6">{children}</main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
